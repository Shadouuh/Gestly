# Imágenes de productos

En **Mi Catálogo → Agregar producto** (también en **Editar producto**) se puede subir un JPG, PNG o WebP de hasta 5 MB, buscar por nombre en Google Imágenes o conservar una URL externa. La imagen elegida se guarda en `server/uploads/products/` y la ruta pública `/uploads/products/<archivo>` se envía a `products.image_url` al guardar el producto. Los archivos de esa carpeta no se versionan en Git.

Para habilitar la búsqueda, agregar en `server/.env`:

```env
SERPAPI_API_KEY=tu_clave
```

Reiniciar `npm run dev`. Se usa [SerpApi Google Images](https://serpapi.com/google-images-api) porque la [API oficial Custom Search JSON](https://developers.google.com/custom-search/v1/overview) ya no acepta nuevos clientes. La clave permanece en el servidor. La búsqueda ofrece hasta cuatro resultados y descarga al servidor sólo la imagen seleccionada; si no hay clave, la subida manual sigue funcionando. La selección se mantiene diez minutos, por lo que si vence hay que buscar de nuevo. Al cancelar el formulario después de subir o elegir una imagen, el archivo ya descargado queda sin asignar; queda pendiente una limpieza de imágenes huérfanas para una etapa posterior.

Las imágenes encontradas pueden estar sujetas a derechos de autor. El usuario debe verificar que puede utilizarlas.

Para probar la API de imágenes con un servidor de pruebas en el puerto 3002:

```powershell
$env:PORT='3002'; node server/src/index.js
# Desde otra terminal:
npm run test:product-images --workspace=server
```
