# Secciones y tablas personalizadas

Cada sección del menú es un **nodo** (`custom_nodes`) del negocio activo. Un nodo contiene una o más tablas (`custom_tables`). Cada tabla tiene sus columnas (`custom_columns`) y filas (`custom_rows`). Las filas guardan sus datos en `values_json`, usando el ID de columna como clave. Los datos anteriores se conservan al migrar: cada sección original se transforma en un nodo con su tabla existente.

```text
businesses 1 ── N custom_nodes 1 ── N custom_tables
                                           ├── N custom_columns
                                           └── N custom_rows
```

## Uso

1. «Agregar sección» en el sidebar crea el nodo y su primera tabla.
2. «Nueva tabla» agrega otras tablas al mismo nodo. Las pestañas eligen cuál se ve.
3. El control de la esquina superior derecha alterna entre tabla y cards. La vista de cards intenta destacar nombre/título, categoría/fecha y números según los nombres y tipos de las columnas. La elección de vista se guarda en el navegador por tabla.
4. «Columna» permite texto, número, fecha, sí/no, **relación** o **total calculado**. «Insertar dato» genera el formulario a partir de esas columnas.

### Relaciones

Una columna de relación puede apuntar a otra tabla personalizada del mismo negocio, esté en el mismo nodo o en otro. También puede apuntar a ventas, movimientos de caja, productos, clientes, proveedores o sucursales existentes. Al llenar una fila se elige el registro destino desde un selector. Se guarda el ID y el backend verifica que pertenezca al mismo negocio. No se puede eliminar una fila personalizada mientras otra fila personalizada la referencie.

### Totales calculados

Una columna de total puede sumar una columna numérica de otra tabla personalizada, el `total` de ventas o el `amount` de movimientos de caja. El resultado se consulta al abrir la tabla y no se escribe en `values_json`.

Se puede filtrar de cuatro formas:

- **Todos:** suma el origen completo del negocio.
- **Valor fijo:** por ejemplo ventas con `status = paid` o caja con `type = expense`.
- **Comparar con una columna de esta fila:** por ejemplo, `branch_id` del origen igual al ID de sucursal guardado en la fila actual.
- **Registros relacionados con esta fila:** para tablas personalizadas, suma solamente las filas cuya columna de relación apunta a la fila actual.

Las ventas anuladas no se incluyen en los totales. Estos cálculos son informativos; no emiten facturas ni modifican stock o registros de origen.

## Instalación y verificación

Ejecutar una vez después de actualizar el código (también se puede repetir sin duplicar nodos):

```bash
npm run migrate:custom-sections --workspace=server
```

Para ejecutar la prueba de API con un servidor independiente en `http://localhost:3002`:

```bash
$env:PORT = '3002'
cd server
node src/index.js
# En otra terminal, desde la raíz del repositorio:
npm run test:custom-nodes --workspace=server
```

La prueba crea datos temporales en el primer negocio de la base y los elimina al terminar; no modifica ventas, caja ni productos existentes.

## Alcance actual

Los nodos pertenecen al negocio, sin permisos propios por usuario. Los selectores de relaciones muestran hasta 500 registros recientes del destino. Las sumas de tablas personalizadas se calculan recorriendo sus filas; antes de usar esto con tablas muy grandes habrá que agregar paginación, búsqueda en el servidor e índices para los campos consultados. Los gráficos quedan para una etapa posterior.
