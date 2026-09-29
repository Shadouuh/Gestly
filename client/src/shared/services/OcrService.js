import Tesseract from 'tesseract.js';

const ENGINE_LABELS = {
  tesseract_psm3: 'Tesseract PSM 3 (Auto)',
  tesseract_psm4: 'Tesseract PSM 4 (Columna única)',
  tesseract_psm6: 'Tesseract PSM 6 (Bloque uniforme)',
  tesseract_psm3_oem1: 'Tesseract PSM 3 + OEM LSTM',
  scribe: 'Scribe.js OCR',
};

const runTesseractWithPsm = async (image, lang, psm, oem = 3, label) => {
  const start = Date.now();
  try {
    const worker = await Tesseract.createWorker(lang, oem, {
      tessedit_pageseg_mode: String(psm),
      preserve_interword_spaces: '0',
    });
    const { data } = await worker.recognize(image);
    await worker.terminate();
    return {
      text: data.text,
      words: data.words,
      time_s: ((Date.now() - start) / 1000).toFixed(1),
      label,
      psm,
      oem,
    };
  } catch (err) {
    console.error(`[${label}] Error:`, err);
    return { text: '', words: [], time_s: '0', label, error: err.message };
  }
};

export const runAllEngines = async (image, lang = 'spa') => {
  const engines = [
    runTesseractWithPsm(image, lang, 3, 3, ENGINE_LABELS.tesseract_psm3),
    runTesseractWithPsm(image, lang, 4, 3, ENGINE_LABELS.tesseract_psm4),
    runTesseractWithPsm(image, lang, 6, 3, ENGINE_LABELS.tesseract_psm6),
    runTesseractWithPsm(image, lang, 3, 1, ENGINE_LABELS.tesseract_psm3_oem1),
  ];

  const results = await Promise.all(engines);

  const bestText = results.reduce((best, r) => {
    if (!r.text) return best;
    const lines = r.text.split('\n').filter(l => l.trim()).length;
    const currentLines = best ? best.text.split('\n').filter(l => l.trim()).length : 0;
    return lines > currentLines ? r : best;
  }, null);

  return { results, bestText: bestText?.text || '' };
};

export const recognizeBest = async (image) => {
  const { bestText } = await runAllEngines(image);
  return bestText;
};

export const checkOcrEngine = async () => {
  return { success: true, engine: 'tesseract.js', version: Tesseract.version };
};
