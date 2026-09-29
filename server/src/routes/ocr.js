import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';
import { analyzeCatalogImage, benchmarkCatalogOcr, getPythonOcrHealth } from '../ocr/catalogOcrService.js';
import { analyzeWithGemini, getGeminiHealth } from '../ocr/geminiOcrService.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
});

router.get('/health', authMiddleware, async (req, res) => {
  try {
    const python = await getPythonOcrHealth();
    res.json({
      success: true,
      jsLibraries: ['tesseract.js'],
      pythonLibraries: ['OpenCV', 'Pillow', 'rapidocr_onnxruntime'],
      python,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error.message || 'Python OCR no disponible',
    });
  }
});

router.post('/catalog/analyze', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'La imagen es obligatoria' });
  }

  try {
    const result = await analyzeCatalogImage(req.file);
    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[ocr] catalog analyze failed:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'No se pudo analizar la imagen',
    });
  }
});

router.post('/catalog/benchmark', authMiddleware, async (req, res) => {
  try {
    const result = await benchmarkCatalogOcr({
      manifestPath: req.body?.manifestPath || null,
      engineIds: Array.isArray(req.body?.engineIds) ? req.body.engineIds : ['rapidocr'],
      minPrecisionGain: Number(req.body?.minPrecisionGain || 0.02),
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[ocr] catalog benchmark failed:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'No se pudo ejecutar el benchmark OCR',
    });
  }
});

router.get('/gemini/health', authMiddleware, async (req, res) => {
  try {
    const health = getGeminiHealth();
    res.json({ success: true, ...health });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error.message || 'Gemini OCR no disponible',
    });
  }
});

router.post('/gemini/analyze', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'La imagen es obligatoria' });
    }

    const result = await analyzeWithGemini(req.file);
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('[ocr] gemini analyze unexpected error:', error);
    return res.status(200).json({
      success: true,
      provider: 'gemini',
      model: null,
      productCount: 0,
      avgConfidence: 0,
      products: [],
      detectedText: '',
      warnings: [error.message || 'Error al procesar con Gemini'],
      error: error.message || 'Error desconocido',
    });
  }
});

export default router;
