import { smartFormat } from '../../../client/src/shared/services/SmartFormatter.js';

const HEADER_WORDS = new Set([
  'kiosco', 'bebidas', 'almacen', 'limpieza', 'lacteos', 'carnes', 'verduras',
  'frutas', 'congelados', 'panaderia', 'reposteria', 'perfumeria', 'higiene',
  'mascotas', 'electro', 'hogar', 'indumentaria', 'ferreteria', 'jugueteria',
  'libreria', 'cuidado personal', 'bebe', 'farmacia', 'medicamentos',
  'sin stock', 'producto', 'productos', 'codigo', 'precio', 'precios',
  'lista', 'detalle', 'descripcion', 'marca', 'marcas', 'proveedor',
  'proveedores', 'ofertas', 'oferta', 'promo', 'promocion',
]);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeText = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const tokenize = (value = '') =>
  normalizeText(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const comparableName = (value = '') =>
  tokenize(value)
    .join(' ')
    .trim();

const normalizeOcrComparable = (value = '') =>
  comparableName(value)
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/8/g, 'b')
    .replace(/\s+/g, ' ')
    .trim();

const median = (numbers) => {
  const sorted = [...numbers].filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2))
    : Number(sorted[middle].toFixed(2));
};

const isGarbageName = (name) => {
  if (!name || name.length < 2) return true;
  const clean = name.replace(/[\[\]{}|_~^`@#$%^*(){}\-\+\.\s]/g, '');
  if (!clean || clean.length < 2) return true;
  if (/^[0-9\s.,$%]+$/.test(name)) return true;
  if (/^[oO0\-*+]+$/.test(name.trim())) return true;
  if (/^(AE|E|AO|OE|EO)$/i.test(name.trim())) return true;
  const letters = name.replace(/[^a-zA-ZÀ-ÿáéíóúñ]/g, '');
  return letters.length === 0;
};

const isLikelyHeader = (name) => {
  const lower = normalizeText(name).replace(/[^a-z0-9]/g, '');
  if (HEADER_WORDS.has(lower)) return true;
  const isAllCaps = /^[A-ZÁÉÍÓÚÑ\s]{3,}$/.test(name);
  const fewWords = name.split(/\s+/).length <= 3;
  if (!isAllCaps || !fewWords || /\d/.test(name)) return false;
  const words = normalizeText(name).split(/\s+/).filter(Boolean);
  return words.some((word) => HEADER_WORDS.has(word));
};

const parseArgPrice = (value) => {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9,.]/g, '');
  if (!cleaned) return 0;
  if (cleaned.includes(',')) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
  }
  if ((cleaned.match(/\./g) || []).length >= 2) {
    return parseFloat(cleaned.replace(/\./g, '')) || 0;
  }
  if (cleaned.includes('.') && cleaned.length - cleaned.indexOf('.') > 3) {
    return parseFloat(cleaned.replace(/\./g, '')) || 0;
  }
  return parseFloat(cleaned) || 0;
};

const findAllPrices = (line) => {
  const results = [];
  const re = /\d+(?:\.\d{3})*(?:,\d{1,2})?/g;
  let match;

  while ((match = re.exec(line)) !== null) {
    const after = line.slice(match.index + match[0].length).trim();
    const hasLetterAfter = /^[a-zA-ZÀ-ÿ]/.test(after);
    if (!hasLetterAfter || /^(?:%|\s*$)/.test(after)) {
      const price = parseArgPrice(match[0]);
      if (price > 0) results.push(price);
    }
  }

  return results;
};

const cleanOcrLine = (line) => {
  if (!line) return '';
  const cleaned = line
    .replace(/[\[\]{}_~^`@#$%^*()|]/g, ' ')
    .replace(/[•\–\—\-\+]{2,}/g, ' ')
    .replace(/\.{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const collapsedTokens = [];
  let previousNormalized = '';
  for (const token of tokens) {
    const normalized = normalizeText(token).replace(/[^a-z0-9]/g, '');
    if (normalized && normalized === previousNormalized) continue;
    collapsedTokens.push(token);
    previousNormalized = normalized;
  }
  const deduped = collapsedTokens.join(' ').trim();

  if (/^[^a-zA-Z0-9À-ÿáéíóúñ]+$/.test(deduped)) return '';
  return deduped;
};

const getLineFingerprint = (line = '') =>
  normalizeText(line)
    .replace(/\d+(?:[.,]\d+)?/g, '#')
    .replace(/[^a-z0-9#\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const dedupeRawLines = (rawLines) => {
  const seen = new Set();
  const result = [];

  for (const line of rawLines) {
    const fingerprint = getLineFingerprint(line.cleaned);
    if (!fingerprint) continue;
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    result.push(line);
  }

  return result;
};

const getNameQuality = (name = '') => {
  const normalized = normalizeText(name);
  const tokens = tokenize(name);
  const letters = normalized.replace(/[^a-z]/g, '');
  const vowels = (letters.match(/[aeiou]/g) || []).length;
  const weirdTokens = tokens.filter((token) => token.length >= 5 && !/[aeiou0-9]/.test(token)).length;
  const longTokens = tokens.filter((token) => token.length >= 11).length;
  const digitTokens = tokens.filter((token) => /^\d+$/.test(token)).length;

  let score = 1;
  if (tokens.length === 0) score -= 1;
  if (letters.length < 3) score -= 0.45;
  if (vowels === 0) score -= 0.35;
  if (letters.length >= 5 && (vowels / Math.max(letters.length, 1)) < 0.22) score -= 0.2;
  if (tokens.length > 6) score -= Math.min(0.25, (tokens.length - 6) * 0.05);
  if (weirdTokens > 0) score -= Math.min(0.45, weirdTokens * 0.18);
  if (longTokens > 0) score -= Math.min(0.15, longTokens * 0.05);
  if (digitTokens > 1) score -= 0.1;

  return {
    score: clamp(Number(score.toFixed(2)), 0, 1),
    tokenCount: tokens.length,
    letters: letters.length,
    vowels,
    weirdTokens,
  };
};

const shouldApplySmartCorrection = (originalName, smarted) => {
  if (!smarted?.corrected) return false;
  if (normalizeText(smarted.corrected) === normalizeText(originalName)) return true;
  if ((smarted.confidence || 0) < 0.78) return false;

  const originalComparable = comparableName(originalName);
  const correctedComparable = comparableName(smarted.corrected);
  if (!originalComparable || !correctedComparable) return false;

  const originalTokens = tokenize(originalName);
  const correctedTokens = tokenize(smarted.corrected);
  const overlap = originalTokens.filter((token) => correctedTokens.includes(token)).length;
  const minTokenCount = Math.max(1, Math.min(originalTokens.length, correctedTokens.length));
  const overlapRatio = overlap / minTokenCount;
  const editRatio = levenshtein(originalComparable, correctedComparable) / Math.max(originalComparable.length, correctedComparable.length, 1);

  return overlapRatio >= 0.5 || editRatio <= 0.34;
};

const buildRawLineInfo = (text = '', index = 0) => {
  const cleaned = cleanOcrLine(text);
  const prices = findAllPrices(cleaned);
  const hasLetter = /[a-zA-ZÀ-ÿáéíóúñ]/.test(cleaned);
  let kind = 'empty';
  if (cleaned) {
    if (hasLetter && prices.length > 0) kind = 'product_or_name_price';
    else if (hasLetter) kind = 'name_only';
    else if (prices.length > 0) kind = 'price_only';
    else kind = 'noise';
  }

  return {
    index,
    text,
    cleaned,
    prices,
    hasLetter,
    kind,
  };
};

const buildMergedEntries = (text = '') => {
  const rawLines = dedupeRawLines(String(text || '')
    .split('\n')
    .map((line, index) => buildRawLineInfo(line, index))
    .filter((line) => line.cleaned));

  const merged = [];
  let pending = null;

  for (const line of rawLines) {
    const isPriceOnly = line.prices.length > 0 && !line.hasLetter;
    const isNameOnly = line.hasLetter && line.prices.length === 0;
    const isFullLine = line.hasLetter && line.prices.length > 0;

    if (isFullLine) {
      let namePart = line.cleaned;
      let lastPriceIdx = -1;
      const re = /\d+(?:\.\d{3})*(?:,\d{1,2})?/g;
      let match;

      while ((match = re.exec(line.cleaned)) !== null) {
        const after = line.cleaned.slice(match.index + match[0].length).trim();
        if (!/^[a-zA-ZÀ-ÿ]/.test(after)) lastPriceIdx = match.index;
      }

      if (lastPriceIdx >= 0) namePart = line.cleaned.substring(0, lastPriceIdx).trim();
      if (pending) {
        merged.push(pending);
        pending = null;
      }
      merged.push({
        name: namePart,
        prices: [...line.prices],
        sourceLineIndexes: [line.index],
        sourceLines: [line.cleaned],
      });
      continue;
    }

    if (isNameOnly) {
      if (pending && pending.prices.length === 0) {
        pending.name += ` ${line.cleaned}`;
        pending.sourceLineIndexes.push(line.index);
        pending.sourceLines.push(line.cleaned);
      } else {
        if (pending) merged.push(pending);
        pending = {
          name: line.cleaned,
          prices: [],
          sourceLineIndexes: [line.index],
          sourceLines: [line.cleaned],
        };
      }
      continue;
    }

    if (isPriceOnly) {
      if (pending) {
        pending.prices.push(...line.prices);
        pending.sourceLineIndexes.push(line.index);
        pending.sourceLines.push(line.cleaned);
      } else if (merged.length > 0) {
        merged[merged.length - 1].prices.push(...line.prices);
        merged[merged.length - 1].sourceLineIndexes.push(line.index);
        merged[merged.length - 1].sourceLines.push(line.cleaned);
      }
      continue;
    }

    if (pending) {
      merged.push(pending);
      pending = null;
    }
  }

  if (pending) merged.push(pending);
  return { rawLines, merged };
};

const buildCandidateReview = (entry, index, source = {}) => {
  let name = String(entry.name || '');
  name = name.replace(/^\d+\s*[\)\]\-*\.]\s*/, '').trim();
  name = name.replace(/^\[.+\]\s*/, '').trim();

  const uniquePrices = [...new Set(entry.prices || [])].filter((price) => price > 0).sort((a, b) => a - b);
  const smarted = smartFormat(name);
  const correctedName = shouldApplySmartCorrection(name, smarted) ? smarted.corrected : name;
  const quality = getNameQuality(correctedName);
  const rejections = [];
  const warnings = [];

  if (!name || name.length < 2) rejections.push('Nombre vacio o muy corto');
  if (isLikelyHeader(name)) rejections.push('Parece encabezado');
  if (isGarbageName(name)) rejections.push('Texto OCR basura');
  if (uniquePrices.length === 0) rejections.push('Sin precio legible');
  if (quality.score < 0.4) rejections.push('Nombre poco confiable');

  if (quality.score < 0.58) warnings.push('Nombre dudoso');
  if (uniquePrices.length > 2) warnings.push('Multiples precios detectados');
  if (entry.sourceLines.length > 2) warnings.push('Producto armado con varias lineas');

  const candidate = {
    id: `${source.engineId || 'engine'}-${index}-${comparableName(correctedName || name || `line-${index}`)}`,
    name: correctedName,
    _originalName: name !== correctedName ? name : null,
    _smartChanges: smarted.changes || [],
    salePrice: uniquePrices.length >= 2 ? Math.max(...uniquePrices) : (uniquePrices[0] || 0),
    purchasePrice: uniquePrices.length >= 2 ? Math.min(...uniquePrices) : 0,
    _warnings: warnings,
    _sourceEngineId: source.engineId || null,
    _sourceEngineLabel: source.engineLabel || null,
    _sourceLibrary: source.library || null,
    _sourceConfidence: source.confidence ?? null,
    _sourceLines: [...entry.sourceLines],
    _sourceLineIndexes: [...entry.sourceLineIndexes],
    _sourcePrices: uniquePrices,
    _nameQuality: quality.score,
    _reviewTrace: {
      sourceLines: [...entry.sourceLines],
      sourceLineIndexes: [...entry.sourceLineIndexes],
      prices: uniquePrices,
      quality,
      smarted,
    },
  };

  if (rejections.length > 0) {
    return {
      accepted: false,
      candidate,
      rejected: {
        id: candidate.id,
        name: correctedName || name || '',
        originalName: name || '',
        reasons: rejections,
        prices: uniquePrices,
        sourceLines: [...entry.sourceLines],
        sourceLineIndexes: [...entry.sourceLineIndexes],
        quality: quality.score,
        engineId: source.engineId || null,
        engineLabel: source.engineLabel || null,
      },
    };
  }

  return {
    accepted: true,
    candidate,
    rejected: null,
  };
};

export const inspectParsedText = (text, source = {}) => {
  const { rawLines, merged } = buildMergedEntries(text);
  const acceptedCandidates = [];
  const rejectedCandidates = [];

  merged.forEach((entry, index) => {
    const review = buildCandidateReview(entry, index, source);
    if (review.accepted) acceptedCandidates.push(review.candidate);
    if (review.rejected) rejectedCandidates.push(review.rejected);
  });

  return {
    rawLines,
    mergedEntries: merged.map((entry, index) => ({
      id: `${source.engineId || 'engine'}-entry-${index}`,
      name: entry.name,
      prices: [...entry.prices],
      sourceLines: [...entry.sourceLines],
      sourceLineIndexes: [...entry.sourceLineIndexes],
    })),
    acceptedCandidates,
    rejectedCandidates,
  };
};

export const parseProductText = (text, source = {}) => inspectParsedText(text, source).acceptedCandidates;

const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[a.length][b.length];
};

const similarity = (left, right) => {
  const a = comparableName(left);
  const b = comparableName(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.9;

  const aOcr = normalizeOcrComparable(left);
  const bOcr = normalizeOcrComparable(right);
  if (aOcr && bOcr && aOcr === bOcr) return 0.98;

  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);
  const intersection = leftTokens.filter((token) => rightTokens.includes(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size || 1;
  const jaccard = intersection / union;
  const editDistance = levenshtein(a, b);
  const editScore = 1 - (editDistance / Math.max(a.length, b.length, 1));
  const ocrEditDistance = levenshtein(aOcr, bOcr);
  const ocrEditScore = 1 - (ocrEditDistance / Math.max(aOcr.length, bOcr.length, 1));
  return Math.max(jaccard, editScore, ocrEditScore);
};

const aggregateWarnings = (candidates, salePrice, purchasePrice, name, reviewWarnings = []) => {
  const warnings = new Set(reviewWarnings);

  if (!salePrice || salePrice <= 0) warnings.add('Sin precio de venta');
  if (purchasePrice > salePrice) warnings.add('Precio de costo mayor que venta');
  if ((name || '').length < 2) warnings.add('Nombre muy corto');

  for (const candidate of candidates) {
    for (const warning of candidate._warnings || []) warnings.add(warning);
  }

  return [...warnings];
};

const dedupeCandidates = (candidates) => {
  const bestByFingerprint = new Map();

  for (const candidate of candidates) {
    const priceFingerprint = [candidate.salePrice || 0, candidate.purchasePrice || 0].join('|');
    const fingerprint = [
      candidate._sourceEngineId || 'engine',
      comparableName(candidate.name),
      priceFingerprint,
    ].join('|');
    const previous = bestByFingerprint.get(fingerprint);

    if (!previous) {
      bestByFingerprint.set(fingerprint, candidate);
      continue;
    }

    const currentScore = (candidate._nameQuality || 0) + ((candidate._sourceLines || []).length * 0.02);
    const previousScore = (previous._nameQuality || 0) + ((previous._sourceLines || []).length * 0.02);
    if (currentScore > previousScore) {
      bestByFingerprint.set(fingerprint, candidate);
    }
  }

  return [...bestByFingerprint.values()];
};

const shouldKeepConsensusGroup = (group, canonicalName, salePrice, distinctEngines) => {
  const reasons = [];
  const quality = getNameQuality(canonicalName);
  const hasPrice = salePrice > 0;
  const votes = group.candidates.length;

  if (!hasPrice) reasons.push('Sin precio consolidado');
  if (quality.score < 0.42) reasons.push('Nombre final demasiado dudoso');
  if (votes === 1 && distinctEngines === 1 && quality.score < 0.62) reasons.push('Solo un motor lo detecto con baja confianza');
  if (votes === 1 && !hasPrice) reasons.push('Deteccion aislada sin precio');

  return {
    keep: reasons.length === 0,
    reasons,
    quality: quality.score,
  };
};

export const buildConsensusProducts = (engineResults) => {
  const engineReviews = engineResults.map((engine) => {
    const review = inspectParsedText(engine.text, {
      engineId: engine.id,
      engineLabel: engine.label,
      library: engine.library,
      confidence: engine.confidence,
    });

    return {
      engineId: engine.id,
      engineLabel: engine.label,
      confidence: engine.confidence,
      library: engine.library,
      rawLines: review.rawLines,
      mergedEntries: review.mergedEntries,
      acceptedCandidates: dedupeCandidates(review.acceptedCandidates).map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        salePrice: candidate.salePrice,
        purchasePrice: candidate.purchasePrice,
        sourceLines: candidate._sourceLines,
        sourceLineIndexes: candidate._sourceLineIndexes,
        quality: candidate._nameQuality,
      })),
      rejectedCandidates: review.rejectedCandidates,
      candidates: dedupeCandidates(review.acceptedCandidates),
    };
  });

  const candidates = engineReviews.flatMap((engine) => engine.candidates);
  const groups = [];

  for (const candidate of candidates) {
    const score = Math.max(0.5, ((candidate._sourceConfidence ?? 55) / 100));
    let bestGroup = null;
    let bestScore = 0;

    for (const group of groups) {
      const currentScore = similarity(group.anchor, candidate.name);
      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestGroup = group;
      }
    }

    if (!bestGroup || bestScore < 0.72) {
      groups.push({
        anchor: candidate.name,
        candidates: [{ ...candidate, _voteWeight: score }],
      });
      continue;
    }

    bestGroup.candidates.push({ ...candidate, _voteWeight: score });
  }

  const rejectedGroups = [];

  const consensusProducts = groups
    .map((group, index) => {
      const nameVotes = new Map();
      const originalNames = new Set();
      const smartChanges = new Set();
      const sources = new Set();
      const salePrices = [];
      const purchasePrices = [];

      for (const candidate of group.candidates) {
        const key = comparableName(candidate.name) || candidate.name;
        const previous = nameVotes.get(key) || { name: candidate.name, weight: 0 };
        previous.weight += candidate._voteWeight || 1;
        nameVotes.set(key, previous);

        if (candidate._originalName) originalNames.add(candidate._originalName);
        for (const change of candidate._smartChanges || []) smartChanges.add(change);
        if (candidate._sourceEngineLabel) sources.add(candidate._sourceEngineLabel);
        if (candidate.salePrice > 0) salePrices.push(candidate.salePrice);
        if (candidate.purchasePrice > 0) purchasePrices.push(candidate.purchasePrice);
      }

      const canonicalName = [...nameVotes.values()].sort((a, b) => b.weight - a.weight)[0]?.name || group.anchor;
      const salePrice = median(salePrices);
      const purchasePrice = median(purchasePrices);
      const distinctEngines = new Set(group.candidates.map((candidate) => candidate._sourceEngineId).filter(Boolean)).size;
      const keepReview = shouldKeepConsensusGroup(group, canonicalName, salePrice, distinctEngines);
      const reviewSources = group.candidates.map((candidate) => ({
        engineId: candidate._sourceEngineId,
        engineLabel: candidate._sourceEngineLabel,
        library: candidate._sourceLibrary,
        confidence: candidate._sourceConfidence,
        name: candidate.name,
        originalName: candidate._originalName || candidate.name,
        sourceLines: candidate._sourceLines || [],
        sourceLineIndexes: candidate._sourceLineIndexes || [],
        prices: candidate._sourcePrices || [],
        quality: candidate._nameQuality,
      }));

      const product = {
        id: `consensus-${index + 1}`,
        name: canonicalName,
        salePrice,
        purchasePrice,
        _originalName: originalNames.size > 0 ? [...originalNames][0] : null,
        _smartChanges: [...smartChanges],
        _sourceEngines: [...sources],
        _consensusVotes: group.candidates.length,
        _reviewSources: reviewSources,
        _nameQuality: keepReview.quality,
        _warnings: aggregateWarnings(group.candidates, salePrice, purchasePrice, canonicalName, keepReview.keep ? [] : keepReview.reasons),
      };

      if (!keepReview.keep) {
        rejectedGroups.push({
          id: product.id,
          name: product.name,
          reasons: keepReview.reasons,
          votes: product._consensusVotes,
          salePrice: product.salePrice,
          sourceLines: reviewSources.flatMap((source) => source.sourceLines),
          sources: reviewSources,
        });
      }

      return keepReview.keep ? product : null;
    })
    .filter(Boolean)
    .sort((a, b) => b._consensusVotes - a._consensusVotes || a.name.localeCompare(b.name));

  const groupedProducts = groupVariants(consensusProducts);

  return {
    products: groupedProducts,
    rejectedGroups,
    review: {
      engines: engineReviews.map((engine) => ({
        engineId: engine.engineId,
        engineLabel: engine.engineLabel,
        confidence: engine.confidence,
        library: engine.library,
        rawLines: engine.rawLines,
        acceptedCandidates: engine.acceptedCandidates,
        rejectedCandidates: engine.rejectedCandidates,
      })),
      finalProducts: groupedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        salePrice: product.salePrice,
        purchasePrice: product.purchasePrice,
        votes: product._consensusVotes || 0,
        warnings: product._warnings || [],
        sources: product._reviewSources || [],
      })),
      rejectedGroups,
    },
  };
};

const isVariantNameValid = (name) => {
  const value = String(name || '').trim();
  if (!value || value.length < 2) return false;
  if (/^[^a-zA-Z0-9À-ÿ]+$/.test(value)) return false;
  if (HEADER_WORDS.has(normalizeText(value))) return false;
  if (/^[oO0]+$/.test(value)) return false;
  return true;
};

export const groupVariants = (products) => {
  const used = new Set();
  const result = [];

  for (let i = 0; i < products.length; i++) {
    if (used.has(i)) continue;

    const base = products[i];
    const baseWords = tokenize(base.name);
    const group = [{ ...base, variantName: base.name }];
    used.add(i);

    for (let j = i + 1; j < products.length; j++) {
      if (used.has(j)) continue;

      const other = products[j];
      const otherWords = tokenize(other.name);
      let common = 0;

      for (let k = 0; k < Math.min(baseWords.length, otherWords.length); k++) {
        if (baseWords[k] !== otherWords[k]) break;
        common += 1;
      }

      const priceDelta = base.salePrice > 0
        ? Math.abs(base.salePrice - other.salePrice) / base.salePrice
        : 99;

      if (common >= Math.min(2, Math.min(baseWords.length, otherWords.length)) && priceDelta < 0.25) {
        const variantPart = other.name.split(/\s+/).slice(common).join(' ');
        if (isVariantNameValid(variantPart)) {
          group.push({ ...other, variantName: other.name });
          used.add(j);
        }
      }
    }

    if (group.length === 1) {
      result.push({ ...base, isVariantGroup: false, variants: [], variantName: '' });
      continue;
    }

    const allWords = group.map((item) => item.name.split(/\s+/).filter(Boolean));
    let prefixLen = 0;
    for (let k = 0; k < Math.min(...allWords.map((words) => words.length)); k++) {
      if (!allWords.every((words) => normalizeText(words[k]) === normalizeText(allWords[0][k]))) break;
      prefixLen += 1;
    }

    const prefix = prefixLen > 0
      ? group[0].name.split(/\s+/).slice(0, prefixLen).join(' ')
      : group[0].name;

    result.push({
      id: base.id,
      name: prefix,
      salePrice: group[0].salePrice,
      purchasePrice: group[0].purchasePrice,
      isVariantGroup: true,
      variants: group.map((item) => {
        const rest = item.name.slice(prefix.length).trim();
        const variantName = rest && isVariantNameValid(rest) ? rest : item.name;
        return {
          name: variantName,
          fullName: item.name,
          salePrice: item.salePrice,
          purchasePrice: item.purchasePrice,
        };
      }),
      _warnings: [...new Set(group.flatMap((item) => item._warnings || []))],
      _smartChanges: [...new Set(group.flatMap((item) => item._smartChanges || []))],
      _originalName: group[0]._originalName || null,
      _sourceEngines: group.flatMap((item) => item._sourceEngines || []),
      _consensusVotes: group.reduce((sum, item) => sum + (item._consensusVotes || 1), 0),
      _reviewSources: group.flatMap((item) => item._reviewSources || []),
      _nameQuality: Math.max(...group.map((item) => item._nameQuality || 0)),
    });
  }

  return result;
};

export const summarizeConsensus = (engineResults) => {
  const consensus = buildConsensusProducts(engineResults);
  const totalAcceptedCandidates = consensus.review.engines.reduce((sum, engine) => sum + engine.acceptedCandidates.length, 0);
  const totalRejectedCandidates = consensus.review.engines.reduce((sum, engine) => sum + engine.rejectedCandidates.length, 0);

  return {
    products: consensus.products,
    metrics: {
      totalEngineRuns: engineResults.length,
      successfulRuns: engineResults.filter((engine) => !engine.error && engine.text).length,
      totalCandidates: totalAcceptedCandidates,
      rejectedCandidates: totalRejectedCandidates,
      finalProducts: consensus.products.length,
    },
    review: consensus.review,
  };
};
