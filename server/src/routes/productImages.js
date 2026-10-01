import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';
import { downloadProductImage, saveProductImage } from '../services/productImages.js';

const router = Router();
router.use(authMiddleware);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
const choices = new Map();
const CHOICE_TTL = 10 * 60 * 1000;
const httpsUrl = (value) => {
  try { return new URL(value).protocol === 'https:'; }
  catch { return false; }
};
const cleanChoices = () => {
  for (const [id, choice] of choices) if (choice.expiresAt < Date.now()) choices.delete(id);
  while (choices.size > 500) choices.delete(choices.keys().next().value);
};

router.get('/search', async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (query.length < 2 || query.length > 120) return res.status(400).json({ message: 'Ingresá un nombre de producto de 2 a 120 caracteres' });
  if (!process.env.SERPAPI_API_KEY) return res.status(503).json({ message: 'La búsqueda de Google aún no está configurada. Agregá SERPAPI_API_KEY en server/.env.' });
  try {
    const url = new URL('https://serpapi.com/search.json');
    url.search = new URLSearchParams({ engine: 'google_images', q: query, api_key: process.env.SERPAPI_API_KEY, hl: 'es', gl: 'ar', safe: 'active' }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
    if (response.status === 401 || response.status === 403) return res.status(502).json({ message: 'SerpApi rechazó la clave. SERPAPI_API_KEY debe ser una clave de SerpApi, no de Google Cloud.' });
    if (response.status === 429) return res.status(502).json({ message: 'Se agotó el límite de búsquedas de SerpApi. Probá más tarde.' });
    if (!response.ok) return res.status(502).json({ message: 'Google Imágenes no respondió. Revisá la clave o intentá nuevamente.' });
    const data = await response.json();
    if (data.error) return res.status(502).json({ message: 'No se pudo buscar. Revisá la configuración de SerpApi.' });
    cleanChoices();
    const images = (data.images_results || [])
      .filter((item) => !item.unsafe && httpsUrl(item.original) && httpsUrl(item.thumbnail))
      .slice(0, 4)
      .map((item) => {
        const id = randomUUID();
        choices.set(id, { businessId: Number(req.user.businessId), original: item.original, expiresAt: Date.now() + CHOICE_TTL });
        return { id, title: String(item.title || query).slice(0, 150), source: String(item.source || '').slice(0, 100), thumbnail: item.thumbnail };
      });
    res.json({ images });
  } catch (error) {
    console.error('product image search:', error);
    res.status(502).json({ message: 'No se pudo completar la búsqueda de imágenes' });
  }
});

router.post('/select', async (req, res) => {
  cleanChoices();
  const choice = choices.get(String(req.body?.imageId || ''));
  if (!choice || choice.businessId !== Number(req.user.businessId)) return res.status(404).json({ message: 'La opción venció. Volvé a buscar imágenes.' });
  try {
    const imageUrl = await downloadProductImage(choice.original);
    choices.delete(req.body.imageId);
    res.status(201).json({ imageUrl });
  } catch (error) {
    console.error('product image download:', error);
    res.status(422).json({ message: error.message || 'No se pudo guardar la imagen elegida' });
  }
});

router.post('/upload', (req, res) => {
  upload.single('image')(req, res, async (error) => {
    if (error) return res.status(400).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'La imagen supera 5 MB' : 'No se pudo recibir la imagen' });
    if (!req.file) return res.status(400).json({ message: 'Elegí una imagen para subir' });
    try { res.status(201).json({ imageUrl: await saveProductImage(req.file.buffer) }); }
    catch (saveError) { res.status(400).json({ message: saveError.message }); }
  });
});

export default router;
