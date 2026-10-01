# Secciones personalizadas (prototipo)

En el menú lateral de la app, **Agregar sección** crea una sección con título y subtítulo. Dentro de ella se pueden agregar columnas de texto, número, fecha o sí/no, buscar en la tabla e insertar, editar o eliminar filas.

## Modelo de datos

- `custom_tables`: una sección por registro, vinculada al negocio (`business_id`).
- `custom_columns`: definición de las columnas, su tipo y posición.
- `custom_rows`: filas de la sección. `values_json` es un objeto cuyas claves son los IDs de `custom_columns` y cuyos valores son los datos ingresados.

Ejemplo: si las columnas «Material» y «Cantidad» tienen IDs 10 y 11, una fila guarda `{"10":"Madera","11":24}`. Se pueden agregar columnas sin alterar físicamente la estructura SQL. Las filas anteriores mostrarán el nuevo campo vacío.

Las tablas se crean con `npm run migrate:custom-sections --workspace=server`. La migración usa `server/.env`, es repetible y no modifica las tablas existentes.

## Límites de esta primera prueba

La sección pertenece al negocio activo y todavía no tiene permisos por usuario. Se pueden agregar columnas, pero no renombrarlas, reordenarlas ni quitarlas. Los datos son independientes del catálogo y del inventario oficial; esta tabla no cambia el stock. El buscador filtra las filas cargadas en la pantalla, así que para volúmenes grandes habrá que agregar paginación y búsqueda del lado del servidor.
