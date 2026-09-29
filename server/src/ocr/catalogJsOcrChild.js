import fs from 'fs/promises';
import Tesseract from 'tesseract.js';

const [inputPath, outputPath] = process.argv.slice(2);

const mapWithConcurrency = async (items, concurrency, task) => {
  const results = new Array(items.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await task(items[index], index);
    }
  };

  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, worker);
  await Promise.all(workers);
  return results;
};

const lineCount = (text = '') => String(text).split('\n').filter((line) => line.trim()).length;

const withEngineTimeout = async (promiseFactory, onTimeout, label, timeoutMs) => {
  let timeoutId = null;

  try {
    return await Promise.race([
      promiseFactory(),
      new Promise((_, reject) => {
        timeoutId = setTimeout(async () => {
          try {
            await onTimeout();
          } catch (_) {}
          reject(new Error(`${label} supero el tiempo maximo de ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const buildEngineSummary = (engine, result, error) => ({
  id: engine.id,
  label: engine.label,
  library: engine.library,
  engineKind: engine.engineKind || 'js',
  variantId: engine.variant.id,
  variantLabel: engine.variant.label,
  pythonLibrary: engine.variant.library,
  psm: engine.psm || null,
  oem: engine.oem ?? null,
  lang: engine.lang || 'spa',
  durationMs: result?.durationMs || 0,
  confidence: result?.confidence ?? null,
  lineCount: lineCount(result?.text),
  charCount: String(result?.text || '').length,
  text: result?.text || '',
  segments: [],
  error: error ? String(error.message || error) : null,
});

const runTesseractEngine = async (engine, timeoutMs) => {
  const startedAt = Date.now();
  const worker = await Tesseract.createWorker(engine.lang || 'spa', engine.oem ?? 1);

  try {
    const { data } = await withEngineTimeout(async () => {
      await worker.setParameters({
        tessedit_pageseg_mode: String(engine.psm),
        preserve_interword_spaces: '1',
      });

      return worker.recognize(engine.variant.filePath);
    }, async () => {
      await worker.terminate();
    }, engine.label, timeoutMs);

    return {
      text: data.text || '',
      confidence: Number(data.confidence || 0),
      durationMs: Date.now() - startedAt,
    };
  } finally {
    try {
      await worker.terminate();
    } catch (_) {}
  }
};

const runSingleEngine = async (engine, runId, timeoutMs) => {
  console.log(`[ocr-js-child ${runId}] running ${engine.label} on ${engine.variant.label}`);
  try {
    const result = await runTesseractEngine(engine, timeoutMs);
    return buildEngineSummary(engine, result, null);
  } catch (error) {
    console.error(`[ocr-js-child ${runId}] ${engine.label} failed: ${error.message || error}`);
    return buildEngineSummary(engine, null, error);
  }
};

const main = async () => {
  if (!inputPath || !outputPath) {
    throw new Error('Faltan argumentos para catalogJsOcrChild');
  }

  const raw = await fs.readFile(inputPath, 'utf8');
  const payload = JSON.parse(raw);
  const runId = payload.runId || 'unknown';
  const timeoutMs = Number(payload.engineTimeoutMs || 90000);
  const engines = Array.isArray(payload.engines) ? payload.engines : [];

  const results = await mapWithConcurrency(engines, 2, (engine) => runSingleEngine(engine, runId, timeoutMs));
  await fs.writeFile(outputPath, JSON.stringify(results), 'utf8');
};

main().catch((error) => {
  console.error('[ocr-js-child] fatal error:', error);
  process.exit(1);
});
