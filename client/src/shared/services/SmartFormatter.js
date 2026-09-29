const KNOWN_PRODUCTS = {
  'agua mineral': ['agua miveral', 'agua mineval', 'agva mineral', 'agua mneral'],
  'agua': ['avua', 'avga', 'abua'],
  'coca cola': ['coca coa', 'c0ca cola', 'coca eola', 'cola cola'],
  'sprite': ['sorite', 'spr1te', 'snrite', 'esprite'],
  'fanta': ['fanta', 'panta'],
  'manaos': ['manaas', 'manaus', 'mana0s'],
  'quilmes': ['quimes', 'qulmes', 'qu1lmes', 'kilmes'],
  'brahma': ['brahna', 'vrahma', 'brama'],
  'heineken': ['he1neken', 'hieneken'],
  'corona': ['corana', 'cor0na'],
  'pepsi': ['pepsi'],
  'schweppes': ['schveppes', 'shweppes'],
  'paso de los toros': ['paso delos toros'],
  'baggio': ['bajjo', 'vaggio', 'bagio'],
  'cindor': ['c1ndor', 'cind0r'],
  'leche': ['lehe', 'lecke', 'ledhe'],
  'yogur': ['yosur', 'yohur', 'yogurt'],
  'queso': ['gueso', 'qeso'],
  'manteca': ['nante ca', 'manteka'],
  'crema': ['crena', 'krema'],
  'serenisima': ['seren1sima', 'serenissima', 'sernisima'],
  'arroz': ['arros', 'aroz', 'arroj'],
  'fideos': ['f1deos', 'fiedos'],
  'harina': ['har1na', 'jarina'],
  'azucar': ['asucar', 'azufar'],
  'aceite': ['ace1te', 'azeite', 'acpite'],
  'sal': ['sai'],
  'galletitas': ['gal1etitas', 'gayetitas', 'galletinas'],
  'galletas': ['galetas'],
  'caramelos': ['kamelos'],
  'chicles': ['chic1es', 'chikles', 'chiles'],
  'chocolate': ['chocolare', 'chocolete'],
  'papas fritas': ['papa s fritas', 'papas fr1tas', 'papas pritas'],
  'papas': ['papa'],
  'pringles': ['pring1es', 'rincles', 'princles'],
  'lays': ['la ys', 'lags'],
  'alfajor': ['alfahor', 'alfojor'],
  'alfajores': ['alfahores', 'alfojores'],
  'jorgito': ['jorjito'],
  'guaymallen': ['guamallen', 'huaymallen'],
  'milka': ['mi1ka', 'milea'],
  'suchard': ['suhard', 'suchart'],
  'ñucrem': ['nucrem', 'ñukrem'],
  'cachafaz': ['cachafas', 'kakhafaz'],
  'cerveza': ['cerbeza', 'cerueza'],
  'vino': ['v1no', 'bino', 'uino'],
  'detergente': ['derergente'],
  'jabon': ['jahon', 'yabon', 'labon'],
  'lavandina': ['lavantina'],
  'shampoo': ['champoo', 'champu', 'sampos'],
  'cigarrillos': ['cigarr1llos', 'sigarrillos', 'cigarrilas'],
  'helados': ['elados'],
  'panchos': ['panchoss'],
  'huevos': ['huev0s', 'uevos'],
  'mayonesa': ['mayonesa', 'mayoneza', 'mayonesa'],
  'ketchup': ['ketachup', 'ketchup', 'ketchup'],
  'mostaza': ['mostasa', 'mostazo', 'mostaza'],
  'pure de tomate': ['pure de tomate', 'pure de tomato', 'pure tomato'],
  'atun': ['atun', 'atn', 'atun'],
  'lentejas': ['lentejas', 'lenteha', 'lentejas'],
  'porotos': ['porotos', 'porotos', 'porotos'],
  'garbanzos': ['garbanzos', 'garbansos', 'garbanzos'],
  'fideos tirabuzon': ['fideos tirabuzon', 'fideos tirabuzon'],
  'fideos mostachol': ['fideos mostachol', 'fideos mostasol'],
  'fideos spaghetti': ['fideos spaghetti', 'fideos espagueti'],
  'cafe': ['cafe', 'cafe'],
  'te': ['te', 'te'],
  'yerba': ['yerba', 'hierba', 'yerba'],
  'mate cocido': ['mate cocido', 'mate kocido'],
};

const PRODUCT_COMPLETIONS = {
  'agua': 'Agua', 'gaseosa': 'Gaseosa', 'cerveza': 'Cerveza',
  'leche': 'Leche', 'pan': 'Pan', 'arroz': 'Arroz',
  'fideos': 'Fideos', 'harina': 'Harina', 'azucar': 'Azúcar',
  'aceite': 'Aceite', 'sal': 'Sal', 'yogur': 'Yogur',
  'queso': 'Queso', 'manteca': 'Manteca', 'huevos': 'Huevos',
  'galletitas': 'Galletitas', 'caramelos': 'Caramelos',
  'chicles': 'Chicles', 'chocolate': 'Chocolate',
  'alfajor': 'Alfajor', 'helados': 'Helados',
  'panchos': 'Panchos', 'papas': 'Papas', 'vino': 'Vino',
  'jabon': 'Jabón', 'detergente': 'Detergente',
  'lavandina': 'Lavandina', 'shampoo': 'Shampoo',
  'cigarrillos': 'Cigarrillos', 'mayonesa': 'Mayonesa',
  'ketchup': 'Kétchup', 'mostaza': 'Mostaza',
  'atun': 'Atún', 'lentejas': 'Lentejas',
  'porotos': 'Porotos', 'garbanzos': 'Garbanzos',
  'cafe': 'Café', 'te': 'Té', 'yerba': 'Yerba',
};

const BRANDS = new Set([
  'coca', 'cola', 'cocacola', 'quilmes', 'brahma', 'corona',
  'pepsi', 'sprite', 'fanta', 'manaos', 'baggio', 'cindor',
  'heineken', 'patagonia', 'andina', 'schweppes', 'serenisima',
  'nestle', 'nestlé', 'arcor', 'terrabusi', 'milka', 'suchard',
  'kinder', 'ferrero', 'lays', 'pringles', 'georgalos',
  'mondelez', 'maggi', 'knorr', 'hellmanns', 'hellmans',
  'natura', 'dove', 'colgate', 'oral', 'sedal', 'pantene',
  'rexona', 'raid', 'lysoform', 'poett', 'magistral',
  'skip', 'ala', 'jumbo', 'disco', 'coto', 'carrefour',
  'dia', 'chango', 'vea', 'toledo', 'ilolay', 'sancor',
  'lacteos', 'tregar', 'oreo', 'rhodesia', 'jorgito',
  'guaymallen', 'ñucrem', 'cachafaz', 'havanna', 'felFort',
  'villavicencio', 'glaciar', 'eco', 'camel', 'marlboro',
  'multishop', 'pehuamar', 'la', 'del', 'los', 'las',
]);

const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
};

const tokenize = (name) =>
  name.toLowerCase().replace(/[^a-z0-9áéíóúñüA-ZÁÉÍÓÚÑÜ]/g, ' ').split(/\s+/).filter(Boolean);

const findKnownProduct = (name) => {
  const search = name.toLowerCase().trim();
  const tokens = tokenize(search);
  if (tokens.length === 0) return null;

  let bestMatch = null;
  let bestScore = Infinity;

  for (const [product, variants] of Object.entries(KNOWN_PRODUCTS)) {
    for (const variant of variants) {
      const dist = levenshtein(search, variant.toLowerCase());
      if (dist < bestScore) {
        bestScore = dist;
        bestMatch = { product, confidence: Math.max(0, 1 - dist / Math.max(search.length, variant.length)) };
      }
    }
    const dist = levenshtein(search, product.toLowerCase());
    if (dist < bestScore) {
      bestScore = dist;
      bestMatch = { product, confidence: Math.max(0, 1 - dist / Math.max(search.length, product.length)) };
    }
  }

  if (!bestMatch || bestMatch.confidence < 0.4) {
    for (const [product] of Object.entries(KNOWN_PRODUCTS)) {
      const prodTokens = tokenize(product);
      const common = tokens.filter(t => prodTokens.includes(t)).length;
      if (common >= Math.min(tokens.length, prodTokens.length) * 0.5) {
        const conf = common / Math.max(tokens.length, prodTokens.length);
        if (!bestMatch || conf > bestMatch.confidence) {
          bestMatch = { product, confidence: conf };
        }
      }
    }
  }

  return bestMatch && bestMatch.confidence > 0.35 ? bestMatch : null;
};

const applyOcrCorrections = (word) => {
  let corrected = word;
  const subs = [
    [/rn/gi, 'm'], [/cl/gi, 'd'],
    [/vv/gi, 'w'], [/0/g, 'o'],
    [/1/g, 'i'], [/5/g, 's'],
    [/8/g, 'b'], [/3/g, 'e'],
    [/6/g, 'g'], [/4/g, 'a'],
    [/7/g, 't'], [/9/g, 'g'],
    [/\|/g, 'l'], [/!/g, 'i'],
    [/@/g, 'a'], [/\$/g, 's'],
    [/¥/g, 'y'], [/™/g, ''],
    [/®/g, ''], [/©/g, ''],
  ];
  for (const [re, replacement] of subs) {
    if (re.test(corrected)) {
      corrected = corrected.replace(re, replacement);
    }
  }
  return corrected;
};

const normalizeWord = (word) => {
  if (!word || word.length < 1) return word;
  const lower = word.toLowerCase();

  if (['de', 'del', 'la', 'el', 'los', 'las', 'y', 'e', 'con', 'sin', 'en', 'por', 'para', 'al', 'un', 'una', 'su'].includes(lower)) {
    return lower === 'y' ? 'Y' : lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  if (BRANDS.has(lower)) return lower.charAt(0).toUpperCase() + lower.slice(1);

  if (word === word.toUpperCase() && word.length > 2) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

const normalizeWords = (name) => {
  return name.split(/\s+/).map(normalizeWord).join(' ');
};

const smartFormat = (name) => {
  if (!name || name.length < 2) return { corrected: name || '', changes: [], confidence: 0 };

  const original = name;
  let working = name.trim();
  const changes = [];

  const known = findKnownProduct(working);
  if (known && known.confidence > 0.5) {
    const corrected = known.product;
    const origWords = tokenize(working);
    const newWords = tokenize(corrected);
    const maxLen = Math.max(origWords.length, newWords.length);
    for (let i = 0; i < maxLen; i++) {
      if (origWords[i] !== newWords[i]) {
        if (origWords[i] && newWords[i]) {
          changes.push(`${origWords[i]} → ${newWords[i]}`);
        }
      }
    }
    return {
      corrected: normalizeWords(corrected),
      changes,
      confidence: known.confidence,
      matchedProduct: true,
    };
  }

  const words = working.split(/\s+/).filter(Boolean);
  const correctedWords = words.map(w => {
    const ocrFixed = applyOcrCorrections(w);
    if (ocrFixed.toLowerCase() !== w.toLowerCase()) {
      changes.push(`${w} → ${ocrFixed}`);
    }
    const wordKnown = findKnownProduct(ocrFixed);
    if (wordKnown && wordKnown.confidence > 0.6) {
      const correctedWord = wordKnown.product.split(/\s+/)[0];
      if (correctedWord.toLowerCase() !== ocrFixed.toLowerCase()) {
        changes.push(`${ocrFixed} → ${correctedWord}`);
        return correctedWord;
      }
    }
    return ocrFixed;
  });

  const correctedFull = correctedWords.join(' ');
  const knownAfter = findKnownProduct(correctedFull);
  if (knownAfter && knownAfter.confidence > 0.5) {
    return {
      corrected: normalizeWords(knownAfter.product),
      changes,
      confidence: knownAfter.confidence,
      matchedProduct: true,
    };
  }

  if (correctedWords.length > 0) {
    const firstWord = correctedWords[0].toLowerCase();
    if (PRODUCT_COMPLETIONS[firstWord]) {
      const completion = PRODUCT_COMPLETIONS[firstWord];
      if (completion.toLowerCase() !== correctedWords[0].toLowerCase()) {
        changes.push(`${correctedWords[0]} → ${completion}`);
        correctedWords[0] = completion;
      }
    }
  }

  const finalWords = correctedWords.map(normalizeWord);
  const finalName = finalWords.join(' ');

  const origNormalized = original.split(/\s+/).map(w => w.toLowerCase());
  finalWords.forEach((w, i) => {
    if (origNormalized[i] && origNormalized[i] !== w.toLowerCase()) {
      if (!changes.some(c => c.includes(origNormalized[i]))) {
        changes.push(`${origNormalized[i]} → ${w}`);
      }
    }
  });

  const confidence = 0.5 + (knownAfter ? 0.3 : 0) + (changes.length > 0 ? 0.1 : 0);

  return {
    corrected: finalName,
    changes: [...new Set(changes)],
    confidence: Math.min(1, confidence),
    matchedProduct: !!knownAfter,
  };
};

const smartFormatText = (ocrText) => {
  const lines = ocrText.split('\n').filter(l => l.trim());
  return lines.map(line => {
    const result = smartFormat(line.trim());
    return {
      original: line.trim(),
      corrected: result.corrected,
      changes: result.changes,
      confidence: result.confidence,
      matchedProduct: result.matchedProduct,
    };
  });
};

export {
  smartFormat,
  smartFormatText,
  findKnownProduct,
  applyOcrCorrections,
  KNOWN_PRODUCTS,
  PRODUCT_COMPLETIONS,
};
