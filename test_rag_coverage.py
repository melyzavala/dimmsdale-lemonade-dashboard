"""Pruebas de cobertura para las preguntas que el agente puede recibir desde el dashboard."""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SUMMARY = json.loads((ROOT / "resumen_validacion.json").read_text(encoding="utf-8"))
with (ROOT / "dimmsdale_operaciones_2025_2026_ytd.csv").open(encoding="utf-8", newline="") as f:
    ROWS = list(csv.DictReader(f))

PERIODS = {
    "2025 completo": ("2025-01-01", "2025-12-31"),
    "YTD 2025 comparable": ("2025-01-01", "2025-10-29"),
    "YTD 2026": ("2026-01-01", "2026-10-29"),
}
PRODUCTS = ["Limonada clásica", "Limonada rosa", "Limonada baja en azúcar", "Limonada verde", "Limonada mineral"]
CHANNELS = ["Venta directa", "Tiendas minoristas", "Eventos"]

def totals(start, end, product=None, channel=None):
    use = [r for r in ROWS if start <= r["fecha"] <= end and (product is None or r["producto"] == product) and (channel is None or r["canal"] == channel)]
    def s(key): return sum(float(r[key]) for r in use)
    sold, made, waste, income, cm, ebitda = s("litros_vendidos"), s("litros_producidos"), s("merma_litros"), s("ingreso_usd"), s("margen_contribucion_usd"), s("ebitda_simulado_usd")
    return {"rows": len(use), "litros": sold, "merma_litros": waste, "merma_pct": waste / made * 100, "ingreso": income, "mc_pct": cm / income * 100, "ebitda": ebitda}

tests = []
for period, dates in PERIODS.items():
    for product in PRODUCTS:
        for channel in CHANNELS:
            value = totals(*dates, product, channel)
            assert value["rows"] > 0 and value["litros"] > 0
            tests.append(f"Ventas de {product} por {channel} en {period}")
    for product in PRODUCTS:
        assert totals(*dates, product=product)["rows"] > 0
        tests.append(f"EBITDA y merma de {product} en {period}")
    for channel in CHANNELS:
        assert totals(*dates, channel=channel)["rows"] > 0
        tests.append(f"Margen y ventas de {channel} en {period}")
    tests.append(f"Resumen de ventas, EBITDA y merma de {period}")

y26 = totals(*PERIODS["YTD 2026"])
assert round(y26["merma_litros"], 2) == round(SUMMARY["ytd_2026"]["merma_litros"], 2)
pink_retail = totals(*PERIODS["YTD 2026"], "Limonada rosa", "Tiendas minoristas")
assert pink_retail["rows"] > 0

print(f"APROBADO: {len(tests)} preguntas simuladas con cobertura numérica exacta.")
print(f"Merma total YTD 2026: {y26['merma_litros']:.2f} L ({y26['merma_pct']:.2f}%).")
print(f"Limonada rosa / Tiendas minoristas / YTD 2026: {pink_retail['litros']:.1f} L; USD {pink_retail['ingreso']:,.0f}; EBITDA USD {pink_retail['ebitda']:,.0f}; merma {pink_retail['merma_litros']:.2f} L ({pink_retail['merma_pct']:.2f}%).")
