import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { summarizeConsensus } from './catalogParser.js';

const PYTHON_SERVICE_URL = process.env.GESTLY_PYTHON_OCR_URL || 'http://127.0.0.1:8765';
const ENGINE_TIMEOUT_MS = 90000;
const CHILD_TIMEOUT_MS = 180000;
const OCR_CHILD_SCRIPT_PATH = fileURLToPath(new URL('./catalogOcrChild.js', import.meta.url));
const JS_OCR_CHILD_SCRIPT_PATH = fileURLToPath(new URL('./catalogJsOcrChild.js', import.meta.url));

const JS_ENGINE_PLAN = [
  { id: 'tess_psm3_original', label: 'Tesseract PSM 3 + Original', library: 'tesseract.js', engineKind: 'js', variantId: 'original', psm: 3, oem: 1, lang: 'spa' },
  { id: 'tess_psm4_threshold', label: 'Tesseract PSM 4 + Threshold', library: 'tesseract.js', engineKind: 'js', variantId: 'cv2_threshold', psm: 4, oem: 1, lang: 'spa' },
  { id: 'tess_psm6_adaptive', label: 'Tesseract PSM 6 + Adaptive', library: 'tesseract.js', engineKind: 'js', variantId: 'cv2_adaptive', psm: 6, oem: 1, lang: 'spa' },
  { id: 'tess_psm11_contrast', label: 'Tesseract PSM 11 + Contrast', library: 'tesseract.js', engineKind: 'js', variantId: 'pil_contrast', psm: 11, oem: 1, lang: 'spa' },
  { id: 'tess_psm6_gray', label: 'Tesseract PSM 6 + Gray', library: 'tesseract.js', engineKind: 'js', variantId: 'cv2_gray', psm: 6, oem: 1, lang: 'spa' },
  { id: 'tess_psm4_upscale', label: 'Tesseract PSM 4 + Upscale', library: 'tesseract.js', engineKind: 'js', variantId: 'pil_upscale_sharpen', psm: 4, oem: 1, lang: 'spa+eng' },
];

const PYTHON_ENGINE_PLAN = [
  { id: 'py_rapid_original', label: 'RapidOCR Original', library: 'rapidocr_onnxruntime', engineKind: 'python', variantId: 'original', textScore: 0.4, boxThresh: 0.45, unclipRatio: 1.8 },
  { id: 'py_rapid_threshold', label: 'RapidOCR Threshold', library: 'rapidocr_onnxruntime', engineKind: 'python', variantId: 'cv2_threshold', textScore: 0.36, boxThresh: 0.4, unclipRatio: 1.8 },
  { id: 'py_rapid_adaptive', label: 'RapidOCR Adaptive', library: 'rapidocr_onnxruntime', engineKind: 'python', variantId: 'cv2_adaptive', textScore: 0.34, boxThresh: 0.38, unclipRatio: 1.9 },
  { id: 'py_rapid_invert', label: 'RapidOCR Invert', library: 'rapidocr_onnxruntime', engineKind: 'python', variantId: 'pil_invert', textScore: 0.32, boxThresh: 0.35, unclipRatio: 2.0 },
  { id: 'py_rapid_close', label: 'RapidOCR Morph Close', library: 'rapidocr_onnxruntime', engineKind: 'python', variantId: 'cv2_morph_close', textScore: 0.35, boxThresh: 0.38, unclipRatio: 1.9 },
  { id: 'py_rapid_upscale', label: 'RapidOCR Upscale', library: 'rapidocr_onnxruntime', engineKind: 'python', variantId: 'pil_upscale_sharpen', textScore: 0.3, boxThresh: 0.34, unclipRatio: 2.1 },
];

const ENGINE_PLAN = [...JS_ENGINE_PLAN, ...PYTHON_ENGINE_PLAN];

const lineCount = (text = '') => String(text).split('\n').filter((line) => line.trim()).length;

const logRun = (runId, message, extra) => {
  if (extra !== undefined) {
    console.log(`[ocr ${runId}] ${message}`, extra);
    return;
  }
  console.log(`[ocr ${runId}] ${message}`);
};

const fetchJson = async (url, payload) => {
  const response = await fetch(url, {
    method: payload ? 'POST' : 'GET',
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Python OCR error ${response.status}`);
  }
  return data;
};

export const getPythonOcrHealth = async () => fetchJson(`${PYTHON_SERVICE_URL}/health`);

const postprocessEngineResults = async (engineResults, runId) => {
  const payload = await fetchJson(`${PYTHON_SERVICE_URL}/postprocess`, {
    runId,
    engineResults,
  });
  return payload;
};

export const benchmarkCatalogOcr = async ({
  manifestPath = null,
  engineIds = ['rapidocr'],
  minPrecisionGain = 0.02,
} = {}) => {
  return fetchJson(`${PYTHON_SERVICE_URL}/benchmark`, {
    runId: crypto.randomUUID(),
    manifestPath,
    engineIds,
    minPrecisionGain,
  });
};

const getVariantMap = (variants) => {
  const map = new Map();
  for (const variant of variants) map.set(variant.id, variant);
  return map;
};

const ensureVariant = (variantMap, variantId) => {
  if (variantMap.has(variantId)) return variantMap.get(variantId);
  return variantMap.get('original');
};

const buildEngineSummary = (engine, variant, result, error) => ({
  id: engine.id,
  label: engine.label,
  library: engine.library,
  engineKind: engine.engineKind || 'js',
  variantId: variant.id,
  variantLabel: variant.label,
  pythonLibrary: variant.library,
  psm: engine.psm || null,
  oem: engine.oem ?? null,
  lang: engine.lang || 'spa',
  durationMs: result?.durationMs || 0,
  confidence: result?.confidence ?? null,
  lineCount: lineCount(result?.text),
  charCount: String(result?.text || '').length,
  text: result?.text || '',
  segments: Array.isArray(result?.segments) ? result.segments : [],
  error: error ? String(error.message || error) : null,
});

const logEngineResults = (runId, engineResults) => {
  for (const engine of engineResults) {
    logRun(runId, `engine ${engine.label}`, {
      variant: engine.variantLabel,
      library: engine.library,
      branch: engine.engineKind,
      chars: engine.charCount,
      lines: engine.lineCount,
      confidence: engine.confidence,
      ms: engine.durationMs,
      error: engine.error || null,
    });
  }
};

const logConsensusProducts = (runId, products) => {
  for (const product of products) {
    logRun(runId, `product ${product.name}`, {
      salePrice: product.salePrice,
      purchasePrice: product.purchasePrice,
      votes: product._consensusVotes || 0,
      engines: (product._sourceEngines || []).length,
    });
  }
};

const runJsEngines = async (variantMap, runId, workingDir) => {
  const payloadPath = path.join(workingDir, 'js-ocr-input.json');
  const outputPath = path.join(workingDir, 'js-ocr-output.json');
  const payload = {
    runId,
    engineTimeoutMs: ENGINE_TIMEOUT_MS,
    engines: JS_ENGINE_PLAN.map((engine) => {
      const variant = ensureVariant(variantMap, engine.variantId);
      return {
        ...engine,
        variant,
      };
    }),
  };

  await fs.writeFile(payloadPath, JSON.stringify(payload), 'utf8');

  try {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [JS_OCR_CHILD_SCRIPT_PATH, payloadPath, outputPath], {
        cwd: path.dirname(JS_OCR_CHILD_SCRIPT_PATH),
        env: {
          ...process.env,
          FORCE_COLOR: '0',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let finished = false;
      const settle = (callback) => (value) => {
        if (finished) return;
        finished = true;
        callback(value);
      };

      const resolveOnce = settle(resolve);
      const rejectOnce = settle(reject);

      streamChildLogs(runId, child.stdout, 'log');
      streamChildLogs(runId, child.stderr, 'error');

      child.on('error', rejectOnce);
      child.on('close', (code) => {
        if (code === 0) {
          resolveOnce();
          return;
        }
        rejectOnce(new Error(`El subproceso JS OCR termino con codigo ${code}`));
      });
    });

    const raw = await fs.readFile(outputPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    logRun(runId, 'js OCR batch failed', error.message || error);
    return JS_ENGINE_PLAN.map((engine) => {
      const variant = ensureVariant(variantMap, engine.variantId);
      return buildEngineSummary(engine, variant, null, error);
    });
  }
};

const runPythonEngines = async (variantMap, runId) => {
  const payloadPlans = PYTHON_ENGINE_PLAN.map((engine) => {
    const variant = ensureVariant(variantMap, engine.variantId);
    return {
      id: engine.id,
      label: engine.label,
      variantId: variant.id,
      variantLabel: variant.label,
      variantLibrary: variant.library,
      filePath: variant.filePath,
      textScore: engine.textScore,
      boxThresh: engine.boxThresh,
      unclipRatio: engine.unclipRatio,
      useDet: true,
      useCls: true,
      useRec: true,
    };
  });

  try {
    logRun(runId, `running ${payloadPlans.length} python OCR engines in parallel`);
    const payload = await fetchJson(`${PYTHON_SERVICE_URL}/ocr`, {
      runId,
      plans: payloadPlans,
    });
    const externalResults = Array.isArray(payload.engineResults) ? payload.engineResults : [];
    const externalMap = new Map(externalResults.map((engine) => [engine.id, engine]));

    return PYTHON_ENGINE_PLAN.map((engine) => {
      const variant = ensureVariant(variantMap, engine.variantId);
      const external = externalMap.get(engine.id);
      if (!external) {
        return buildEngineSummary(engine, variant, null, new Error('RapidOCR no devolvio resultado para este plan'));
      }
      return buildEngineSummary(engine, variant, external, external.error ? new Error(external.error) : null);
    });
  } catch (error) {
    logRun(runId, 'python OCR batch failed', error.message || error);
    return PYTHON_ENGINE_PLAN.map((engine) => {
      const variant = ensureVariant(variantMap, engine.variantId);
      return buildEngineSummary(engine, variant, null, error);
    });
  }
};

const preprocessImage = async (imagePath, workingDir, runId) => {
  const outputDir = path.join(workingDir, 'variants');
  const payload = await fetchJson(`${PYTHON_SERVICE_URL}/preprocess`, {
    imagePath,
    outputDir,
    runId,
  });
  return payload.variants || [];
};

const writeTempImage = async (file) => {
  const runId = crypto.randomUUID();
  const workingDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gestly-ocr-'));
  const extension = path.extname(file.originalname || '') || '.png';
  const imagePath = path.join(workingDir, `input${extension}`);
  await fs.writeFile(imagePath, file.buffer);
  return { runId, workingDir, imagePath };
};

const streamChildLogs = (runId, stream, method = 'log') => {
  let buffer = '';

  stream.on('data', (chunk) => {
    buffer += String(chunk);
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      console[method](`[ocr-child ${runId}] ${trimmed}`);
    }
  });

  stream.on('end', () => {
    const trimmed = buffer.trim();
    if (trimmed) console[method](`[ocr-child ${runId}] ${trimmed}`);
  });
};

const runAnalysisInChild = async ({ runId, workingDir, imagePath, originalname }) => {
  const outputPath = path.join(workingDir, 'ocr-result.json');

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
      OCR_CHILD_SCRIPT_PATH,
      runId,
      workingDir,
      imagePath,
      originalname || 'catalog-image.png',
      outputPath,
    ], {
      cwd: path.dirname(OCR_CHILD_SCRIPT_PATH),
      env: {
        ...process.env,
        FORCE_COLOR: '0',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let finished = false;
    let timeoutId = null;

    const settle = (callback) => (value) => {
      if (finished) return;
      finished = true;
      if (timeoutId) clearTimeout(timeoutId);
      callback(value);
    };

    const resolveOnce = settle(resolve);
    const rejectOnce = settle(reject);

    streamChildLogs(runId, child.stdout, 'log');
    streamChildLogs(runId, child.stderr, 'error');

    timeoutId = setTimeout(() => {
      child.kill();
      rejectOnce(new Error(`El OCR backend supero el tiempo maximo de ${CHILD_TIMEOUT_MS}ms`));
    }, CHILD_TIMEOUT_MS);

    child.on('error', (error) => {
      rejectOnce(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolveOnce();
        return;
      }
      rejectOnce(new Error(`El proceso OCR termino con codigo ${code}`));
    });
  });

  const raw = await fs.readFile(outputPath, 'utf8');
  return JSON.parse(raw);
};

export const analyzeCatalogImageFromPath = async ({ runId, workingDir, imagePath, originalname }) => {
  const effectiveRunId = runId || crypto.randomUUID();
  const effectiveWorkingDir = workingDir || path.dirname(imagePath);

  const pythonHealth = await getPythonOcrHealth();
  logRun(effectiveRunId, 'python preprocess service online', pythonHealth);

  const variants = await preprocessImage(imagePath, effectiveWorkingDir, effectiveRunId);
  const variantMap = getVariantMap(variants);
  logRun(effectiveRunId, `python generated ${variants.length} variants`);
  logRun(effectiveRunId, `starting separate OCR branches: ${JS_ENGINE_PLAN.length} JS + ${PYTHON_ENGINE_PLAN.length} Python`);

  const [jsResults, pythonResults] = await Promise.all([
    runJsEngines(variantMap, effectiveRunId, effectiveWorkingDir),
    runPythonEngines(variantMap, effectiveRunId),
  ]);
  const engineResults = [...jsResults, ...pythonResults];
  let processed;
  try {
    processed = await postprocessEngineResults(engineResults, effectiveRunId);
    logRun(effectiveRunId, 'postprocess pipeline completed', processed.metrics || {});
  } catch (error) {
    logRun(effectiveRunId, 'postprocess pipeline failed, using legacy consensus', error.message || error);
    const legacy = summarizeConsensus(engineResults);
    processed = {
      products: legacy.products,
      metrics: legacy.metrics,
      review: legacy.review,
      warnings: [`postprocess fallback: ${error.message || error}`],
      debug: {},
    };
  }

  logEngineResults(effectiveRunId, engineResults);
  logConsensusProducts(effectiveRunId, processed.products || []);

  return {
    runId: effectiveRunId,
    pythonHealth,
    variants,
    engineResults,
    products: processed.products || [],
    metrics: {
      ...(processed.metrics || {}),
      successfulRuns: engineResults.filter((engine) => !engine.error && engine.text).length,
      totalEngineRuns: engineResults.length,
    },
    review: processed.review || null,
    warnings: processed.warnings || [],
    debug: processed.debug || {},
    enginePlan: ENGINE_PLAN.map((engine) => ({
      id: engine.id,
      label: engine.label,
      library: engine.library,
      psm: engine.psm || null,
      variantId: engine.variantId,
      engineKind: engine.engineKind,
    })),
  };
};

export const analyzeCatalogImage = async (file) => {
  const { runId, workingDir, imagePath } = await writeTempImage(file);

  try {
    return await runAnalysisInChild({
      runId,
      workingDir,
      imagePath,
      originalname: file.originalname,
    });
  } finally {
    await fs.rm(workingDir, { recursive: true, force: true });
  }
};
