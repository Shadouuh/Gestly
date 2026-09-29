# Debug Session: catalog-initial-load
- **Status**: [OPEN]
- **Issue**: El catalogo no muestra productos al entrar por primera vez. El usuario pide forzar recarga constante y agregar validaciones/errores de consola en front para entender por que no aparecen.
- **Debug Server**: http://127.0.0.1:7777/event
- **Log File**: .dbg/trae-debug-log-catalog-initial-load.ndjson

## Reproduction Steps
1. Abrir `/app/catalog`.
2. Observar si al primer render aparecen productos.
3. Verificar si una recarga manual, foco de ventana o tiempo posterior hace que aparezcan.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | La respuesta de la API llega vacia o falla solo en la primera carga | High | Low | Pending |
| B | La normalizacion del front descarta productos validos y deja la lista en vacio | High | Low | Pending |
| C | `businessId` o el ciclo de `loadProducts()` no se estabiliza en el primer render | Medium | Low | Pending |
| D | Hay una condicion de carrera entre carga inicial, refresco silencioso y estado `loading/error` | Medium | Medium | Pending |
| E | Los productos si llegan pero el filtrado/renderizado final del catalogo los oculta | Medium | Low | Pending |

## Log Evidence
- Instrumentation added in `client/src/pages/App/Catalog.jsx`:
  - Bootstrap of `getCurrentBusiness()`
  - Entry/skip/success/error of `loadProducts()`
  - Snapshot of `products`, `filtered`, `loading`, `error`, `search`, `activeCategory`
- Instrumentation added in `client/src/services/api.js`:
  - Request/response/error summaries for `/products` routes
- Session log cleared before reproduction. Current run: `pre-fix`

## Verification Conclusion
[Pending]
