# Debug Session: catalog-branch-load
- **Status**: [OPEN]
- **Issue**: El catalogo no carga de forma confiable al entrar por primera vez. Ademas debe quedar funcional por sucursal, con alta de producto por sucursales y stock inicial separado.
- **Debug Server**: http://127.0.0.1:7778/event
- **Log File**: .dbg/trae-debug-log-catalog-branch-load.ndjson

## Reproduction Steps
1. Entrar a `/app/catalogo`.
2. Verificar si los productos aparecen en la primera carga.
3. Cambiar la sucursal activa y observar si el catalogo refleja stock/productos por sucursal.
4. Abrir alta de producto y revisar si permite seleccionar sucursales y stock inicial por sucursal.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | El `useEffect` inicial de `Catalog.jsx` depende de un `businessId` que llega tarde o queda fuera de sincronizacion con `loadProducts()` | High | Low | Pending |
| B | El modo debug previo o el flujo de auto refresh deja estados `loading/error/products` en orden incorrecto durante el primer mount | High | Low | Pending |
| C | El catalogo muestra stock global siempre y no deriva correctamente el stock visible de la sucursal activa | High | Medium | Pending |
| D | El alta de producto solo crea inventario global/default y no admite sucursales seleccionadas ni stock inicial separado | High | Medium | Pending |
| E | El selector de sucursal del layout y el catalogo no comparten un contrato estable para `selectedBranch` y `branches` en el primer render | Medium | Low | Pending |

## Log Evidence
- `pre-fix`: la API respondio correctamente y de forma consistente.
  - `api.js` reporto `status: 200` y `count: 18` en multiples requests a `/businesses/1/products`.
  - `Catalog.jsx` reporto `normalizedCount: 18` y `droppedCount: 0`.
- Confirmaciones:
  - **A rejected (API vacia/fallando)**: los productos llegan bien desde backend.
  - **B partially confirmed**: no hay perdida en normalizacion, pero la orquestacion de carga era inestable por multiples disparos silenciosos.
  - **C confirmed**: el catalogo no estaba derivando una vista local por sucursal activa; mostraba siempre stock global.
  - **D confirmed**: el alta no permitia seleccionar sucursales ni cargar stock inicial separado.
  - **E confirmed**: faltaba integrar el contrato de `selectedBranch`/`branches` al catalogo y mostrar contexto claro de sucursal.

## Fix Applied
- `Catalog.jsx`
  - Inicializa `businessId` desde `getCurrentBusiness()` en el estado inicial para estabilizar la primera carga.
  - Agrega throttling al auto refresh silencioso para reducir disparos duplicados por foco/visibilidad.
  - Integra `selectedBranch` y `branches` desde `AppLayout`.
  - Filtra productos por sucursal activa usando inventarios por branch.
  - Calcula stock, minimo y metricas por sucursal seleccionada.
  - Expone en UI la sucursal activa.
  - Separa el alta de producto en tabs `General` y `Stock`.
  - Permite elegir sucursales destino y stock inicial/minimo por sucursal.
- `api.js` / `AppLayout.jsx`
  - Mantienen la instrumentacion apuntando a esta sesion para verificacion `post-fix`.

## Verification Conclusion
- User verification after latest fix:
  - Initial load: **Fixed / carga bien**
  - Branch view: **Vista OK**
  - Product creation with branch-specific stock: **Pending user validation**
