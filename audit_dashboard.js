const fs = require('fs');
const path = require('path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const summary = JSON.parse(fs.readFileSync(path.join(root, 'resumen_validacion.json'), 'utf8'));
const start = html.indexOf('const DATA=') + 'const DATA='.length;
const endMatch = /;\r?\n    const \$/.exec(html.slice(start));
const end = endMatch ? start + endMatch.index : -1;
if (start < 'const DATA='.length || end < 0) throw new Error('No se pudo localizar DATA en el HTML.');
const data = JSON.parse(html.slice(start, end));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const close = (a, b, tolerance = 0.02) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;

check(Object.keys(data.cube).length === 72, 'El cubo no contiene las 72 combinaciones esperadas.');
const additive = ['litros_producidos','litros_vendidos','ingreso_usd','costo_variable_total_usd','margen_contribucion_usd','costos_fijos_asignados_usd','ebitda_simulado_usd','merma_litros','meta_ventas_litros','capacidad_litros'];
for (const [cubeKey, entry] of Object.entries(data.cube)) {
  const t = entry.total;
  for (const field of additive) check(Number.isFinite(t[field]), `${cubeKey}: ${field} no es numérico.`);
  check(close(t.margen_contribucion_usd, t.ingreso_usd - t.costo_variable_total_usd), `${cubeKey}: margen de contribución no concilia.`);
  check(close(t.ebitda_simulado_usd, t.margen_contribucion_usd - t.costos_fijos_asignados_usd), `${cubeKey}: EBITDA no concilia.`);
  check(close(t.margen_contribucion_pct, t.margen_contribucion_usd / t.ingreso_usd * 100), `${cubeKey}: margen de contribución porcentual incorrecto.`);
  check(close(t.margen_ebitda_pct, t.ebitda_simulado_usd / t.ingreso_usd * 100), `${cubeKey}: margen EBITDA incorrecto.`);
  check(close(t.merma_pct, t.merma_litros / t.litros_producidos * 100), `${cubeKey}: tasa de merma incorrecta.`);
  check(close(t.utilizacion_capacidad_pct, t.litros_producidos / t.capacidad_litros * 100), `${cubeKey}: utilización de capacidad incorrecta.`);
  const cmPerLiter = t.margen_contribucion_usd / t.litros_vendidos;
  check(close(t.punto_equilibrio_litros, t.costos_fijos_asignados_usd / cmPerLiter), `${cubeKey}: punto de equilibrio incorrecto.`);
  check(close(t.margen_seguridad_pct, (t.litros_vendidos - t.punto_equilibrio_litros) / t.litros_vendidos * 100), `${cubeKey}: margen de seguridad incorrecto.`);
  for (const field of additive) {
    const monthly = entry.mensual.reduce((sum, row) => sum + row[field], 0);
    check(close(t[field], monthly, 0.12), `${cubeKey}: ${field} no concilia con la serie mensual.`);
  }
}

const ytd = data.cube['ytd2026|all|all'].total;
const expectedYtd = summary.ytd_2026;
for (const [htmlField, summaryField] of [
  ['litros_vendidos','litros_vendidos'],['ingreso_usd','ingreso_usd'],['margen_contribucion_pct','margen_contribucion_pct'],
  ['ebitda_simulado_usd','ebitda_simulado_usd'],['margen_ebitda_pct','margen_ebitda_pct'],['merma_pct','merma_pct_produccion'],
  ['utilizacion_capacidad_pct','utilizacion_capacidad_pct'],['punto_equilibrio_litros','punto_equilibrio_litros'],['margen_seguridad_pct','margen_seguridad_pct']
]) check(close(ytd[htmlField], expectedYtd[summaryField]), `YTD 2026: ${htmlField} difiere del resumen validado.`);

for (const row of summary.ytd_2026_por_producto) {
  const t = data.cube[`ytd2026|${row.producto}|all`].total;
  check(close(t.litros_vendidos, row.litros_vendidos), `${row.producto}: litros difieren del RAG.`);
  check(close(t.ingreso_usd, row.ingreso_usd), `${row.producto}: ingresos difieren del RAG.`);
  check(close(t.ebitda_simulado_usd, row.ebitda_simulado_usd), `${row.producto}: EBITDA difiere del RAG.`);
  check(close(t.merma_pct, row.merma_pct_produccion), `${row.producto}: merma difiere del RAG.`);
}
for (const row of summary.ytd_2026_por_canal) {
  const t = data.cube[`ytd2026|all|${row.canal}`].total;
  check(close(t.litros_vendidos, row.litros_vendidos), `${row.canal}: litros difieren del RAG.`);
  check(close(t.ingreso_usd, row.ingreso_usd), `${row.canal}: ingresos difieren del RAG.`);
  check(close(t.ebitda_simulado_usd, row.ebitda_simulado_usd), `${row.canal}: EBITDA difiere del RAG.`);
  check(close(t.margen_contribucion_pct, row.margen_contribucion_pct), `${row.canal}: margen difiere del RAG.`);
}

for (const [period, key] of [['fy2025','flujo_efectivo_2025_completo'],['ytd2025','flujo_efectivo_ytd_2025'],['ytd2026','flujo_efectivo_ytd_2026']]) {
  for (const [field, value] of Object.entries(summary[key])) check(close(data.cash[period][field], value), `${period}: ${field} difiere del RAG.`);
}

check(data.meta.semilla === 20261029 && data.meta.registros === 10005, 'Metadatos de semilla o registros incorrectos.');
check(data.temperatureCorrelation === 0.707, 'Correlación diaria incorrecta.');
check(data.temperatureEvidence.correlacion_pearson_registro === 0.27, 'Correlación por registro incorrecta.');
check(data.temperatureEvidence.variacion_dias_mas_25_vs_hasta_20_pct === 26, 'Brecha térmica incorrecta.');
check(html.includes("['periodFilter','productFilter','channelFilter'].forEach(id=>$(id).addEventListener('change',render))"), 'Los tres filtros no están conectados a render().');
check(html.includes("$('resetFilters').addEventListener('click'"), 'El botón Restablecer no está conectado.');
check(html.includes("const visibleProducts=product==='all'?DATA.meta.productos:[product]"), 'La franja de decisión no respeta el filtro de producto.');
check(html.includes('YTD 2026 fijo · no responde a filtros'), 'El alcance fijo del clima no está indicado.');
check(html.includes('<elevenlabs-convai agent-id="agent_4301m64jcshgewvt7qn13ctvjcra"></elevenlabs-convai>'), 'El agente ElevenLabs no coincide.');
check(html.includes('https://unpkg.com/@elevenlabs/convai-widget-embed'), 'Falta el script de ElevenLabs.');
check(html.includes('embed.windy.com') && html.includes('overlay=temp'), 'El embed de Windy no coincide.');
check(html.includes('class="cosmo-card-head"') && html.indexOf('class="cosmo-help"') < html.indexOf('class="cosmo-panel"'), 'La ayuda de Cosmo no está en el encabezado.');

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
check(new Set(ids).size === ids.length, 'Hay identificadores HTML duplicados.');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
check(Boolean(scriptMatch), 'No se encontró el JavaScript embebido.');
if (scriptMatch) { try { new Function(scriptMatch[1]); } catch (error) { failures.push(`JavaScript inválido: ${error.message}`); } }

if (failures.length) {
  console.error(JSON.stringify({estado:'NO APROBADO',fallos:failures}, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  estado:'APROBADO',
  combinaciones_filtros:Object.keys(data.cube).length,
  conciliaciones_cubo:'72 de 72',
  cruce_rag:'YTD, productos, canales, mensual y flujo de efectivo',
  filtros:'periodo, producto, canal y restablecer conectados',
  embeds:'ElevenLabs y Windy presentes; validación en vivo pendiente de GitHub Pages'
}, null, 2));
