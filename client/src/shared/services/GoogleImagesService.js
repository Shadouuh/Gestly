// Servicio para buscar imágenes de productos usando OpenFoodFacts
// Esta API es ideal para encontrar fotos de productos reales de supermercado, farmacia, etc.
// No requiere API Key para uso básico.

const BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

export const searchImages = async (query) => {
  if (!query) return [];

  try {
    const url = `${BASE_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error buscando productos');
    
    const data = await response.json();
    
    // Filtramos productos que tengan imagen y mapeamos al formato esperado
    const results = (data.products || [])
      .filter(product => product.image_url || product.image_front_url)
      .map(product => ({
        link: product.image_url || product.image_front_url,
        thumbnailLink: product.image_small_url || product.image_front_small_url || product.image_url,
        title: product.product_name || query,
        contextLink: `https://world.openfoodfacts.org/product/${product.code}`
      }))
      .slice(0, 12); // Limitamos a 12 resultados

    // Fallback: Si no hay productos en OpenFoodFacts, intentamos con LoremFlickr para cosas genéricas
    if (results.length === 0) {
      return fallbackSearch(query);
    }

    return results;
  } catch (error) {
    console.error('Error fetching product images:', error);
    return fallbackSearch(query);
  }
};

const fallbackSearch = (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResults = Array.from({ length: 4 }).map((_, index) => ({
        link: `https://loremflickr.com/400/400/${encodeURIComponent(query)}?lock=${index + Date.now()}`,
        thumbnailLink: `https://loremflickr.com/150/150/${encodeURIComponent(query)}?lock=${index + Date.now()}`,
        title: `${query} - Imagen Genérica ${index + 1}`,
        contextLink: '#'
      }));
      resolve(mockResults);
    }, 300);
  });
};
