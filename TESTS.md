# Pruebas reproducibles

Este repositorio conserva las pruebas usadas antes de publicar el dashboard.

## Ejecutar

```bash
node audit_dashboard.js
python test_rag_coverage.py
```

## Cobertura

- `audit_dashboard.js`: verifica las 72 combinaciones de filtros, conciliaciones de métricas, series mensuales y los embeds requeridos.
- `test_rag_coverage.py`: simula 72 preguntas de producto × canal × periodo y comprueba cifras clave que Cosmo debe recuperar desde su base RAG.

Ambas pruebas usan exclusivamente los datos sintéticos incluidos en este repositorio.
