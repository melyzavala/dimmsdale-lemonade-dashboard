# Dimmsdale Lemonade Co. — Dashboard financiero con agente de voz

Actividad académica de ElevenLabs: dashboard financiero interactivo, datos sintéticos reproducibles y agente de voz con RAG.

## Propósito

El proyecto responde una pregunta de decisión: **¿qué productos y canales conviene priorizar al considerar ventas, rentabilidad, merma, capacidad, flujo de efectivo y clima?**

El caso representa a **Dimmsdale Lemonade Co.**, empresa ficticia de limonadas. Todas las cifras empresariales, financieras y meteorológicas históricas son sintéticas y educativas. El corte histórico es el **29 de octubre de 2026**; YTD 2026 se compara exclusivamente con el mismo intervalo de 2025.

## Dashboard

El archivo publicado es [`index.html`](index.html). No requiere instalación ni servidor: se abre directamente en un navegador y está listo para GitHub Pages.

Incluye:

- Filtros interactivos por periodo, producto y canal, con restablecimiento.
- KPIs de litros, ingresos, margen de contribución, EBITDA, flujo libre, capacidad y margen de seguridad.
- Comparativos por producto y canal, tendencia mensual y detalle tabular.
- Análisis de flujo de efectivo y puente de efectivo.
- Dispersión de temperatura y demanda, con umbral operativo de 25 °C.
- Widget meteorológico externo de Los Ángeles, sólo como contexto operativo.
- Agente de voz Cosmo incrustado mediante ElevenLabs.

## Enlaces

- Dashboard en vivo: https://melyzavala.github.io/dimmsdale-lemonade-dashboard/
- Repositorio: https://github.com/melyzavala/dimmsdale-lemonade-dashboard
- Pruebas reproducibles: [`TESTS.md`](TESTS.md)

El agente Cosmo se abre desde el botón flotante integrado en el dashboard publicado.

## Datos y metodología

El dataset contiene 10,005 registros diarios sintéticos de 2025 y YTD 2026, con cinco productos y tres canales:

| Productos | Canales |
|---|---|
| Clásica, rosa, baja en azúcar, verde y mineral | Venta directa, tiendas minoristas y eventos |

Las tasas se recalculan después de cada filtro; no se promedian porcentajes agregados. El EBITDA es una medida sintética de gestión y no equivale a utilidad neta ni a flujo de efectivo.

El agente usa una base RAG con las cifras, reglas de agregación, fórmulas, cruces producto × canal y conceptos académicos. Está configurado para reconocer los límites del caso, no inventar cifras y describir temperatura–ventas como asociación, no causalidad.

## Hallazgos del caso

- YTD 2026: **131,029 litros**, **USD 802,376** de ingresos y **USD 333,369** de EBITDA; este último fue 11.49% mayor que en el periodo comparable de 2025.
- La limonada clásica lidera volumen, margen de contribución y EBITDA por producto en YTD 2026.
- Venta directa tiene el mayor margen de contribución agregado; en YTD 2025 comparable fue **59.65%**.
- Limonada verde presenta el mayor riesgo de merma por producto en YTD 2026: **1.51%**.
- En YTD 2026, los días por encima de **25 °C** promediaron **500.4 litros/día**, frente a **397.1 litros/día** en días de hasta 20 °C. Es una asociación descriptiva, no evidencia causal.
- El flujo neto YTD 2026 fue positivo: **USD 182,097**; el efectivo final alcanzó **USD 545,998**.

## Pruebas realizadas

Se verificó la funcionalidad antes de publicar:

| Prueba | Resultado |
|---|---|
| Combinaciones de filtros | 72 de 72 conciliadas contra el cubo de datos |
| Totales, productos, canales, mensual y flujo de efectivo | Aprobados contra el dataset sintético |
| Preguntas RAG con cruces producto × canal | Probadas en chat y llamada |
| Widget de ElevenLabs | Insertado con el `agent-id` del proyecto |
| Widget meteorológico | Visible como referencia externa; no alimenta al agente automáticamente |

Ejemplos de preguntas de prueba:

1. ¿Qué canal tuvo el mejor margen de contribución en YTD 2025 comparable?
2. ¿Cuál fue el EBITDA de Limonada mineral en Eventos durante 2025 completo?
3. ¿Cuál es el umbral operativo de temperatura y qué relación tiene con las ventas?

## Limitaciones

- Los datos no representan una empresa real ni constituyen asesoría financiera.
- El pronóstico del tiempo es externo y en vivo; no forma parte del dataset ni puede ser leído directamente por Cosmo.
- La correlación temperatura–ventas no demuestra causalidad.
- El agente no puede detectar los filtros activos del dashboard: las preguntas sugeridas copian el contexto para facilitar la consulta.
- El widget de ElevenLabs depende de una conexión a internet, del estado del servicio y de la disponibilidad de créditos del agente.

## Fuentes conceptuales

- [OpenStax, Principles of Accounting Volume 2: Managerial Accounting, capítulo 3](https://openstax.org/books/principles-managerial-accounting/pages/3-introduction-to-cost-volume-profit-analysis)
- [OpenStax, Principles of Accounting Volume 1: Financial Accounting, capítulo 16](https://openstax.org/books/principles-financial-accounting/pages/16-1-explain-the-purpose-of-the-statement-of-cash-flows)
- Keleş, B., Gómez-Acevedo, P. y Shaikh, N. I. (2018). *The impact of systematic changes in weather on the supply and demand of beverages*. International Journal of Production Economics, 195, 186–197. https://doi.org/10.1016/j.ijpe.2017.08.002

## Reflexión

Este ejercicio muestra que un agente de voz no sustituye el análisis, pero sí puede volverlo más accesible. El dashboard concentra evidencia y permite explorar filtros; el RAG ayuda a explicar cifras y fórmulas sin inventar información; y los límites explícitos reducen el riesgo de interpretar un caso didáctico como una recomendación real.

En un entorno profesional, la misma estructura sería útil para orientar conversaciones ejecutivas sobre rentabilidad, operación y liquidez, siempre conectada a fuentes trazables, reglas de agregación verificadas y una revisión humana para decisiones relevantes.

## Uso local

1. Descarga o clona el repositorio.
2. Abre `index.html` en el navegador.
3. Para usar la voz y el widget meteorológico, permite la conexión a internet.

---

Proyecto académico · Dimmsdale Lemonade Co. · Datos sintéticos reproducibles · 2026
