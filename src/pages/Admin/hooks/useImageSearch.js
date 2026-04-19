import { useState } from 'react';
import { searchImages } from '../../../shared/services/GoogleImagesService';

const useImageSearch = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (query) => {
    if (!query) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchImages(query);
      setImages(results);
    } catch (err) {
      setError('No se pudieron cargar las imágenes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setImages([]);
    setError(null);
  };

  return {
    images,
    loading,
    error,
    search,
    clear
  };
};

export default useImageSearch;
