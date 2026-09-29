const GEMINI_BASE_URL = (process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
const TIMEOUT_MS = 60000;

const MODEL_FALLBACK_CHAIN = [
  { model: 'gemini-3.5-flash', apiVersion: 'v1beta' },
  { model: 'gemini-2.5-flash', apiVersion: 'v1' },
  { model: 'gemini-2.5-flash-lite', apiVersion: 'v1' },
  { model: 'gemini-3.5-flash-lite', apiVersion: 'v1beta' },
  { model: 'gemini-3.1-flash-lite', apiVersion: 'v1beta' },
];

const getApiKey = () => process.env.GEMINI_API_KEY || '';

const normalizeValue = (v) => (v === undefined || v === null || v === '' ? null : v);

const parseNumber = (val) => {
  if (val === null || val === undefined || val === '') return null;
  let strVal = String(val).trim();
  if (!isNaN(Number(strVal))) return Number(strVal);
  if (strVal.includes(',')) {
    strVal = strVal.replace(/\./g, '').replace(',', '.');
  }
  const num = Number(strVal);
  return isNaN(num) ? null : num;
};

const OCR_PROMPT = `Eres un experto en reconocimiento de productos de supermercado. Analizá la imagen y extraé cada producto visible.

IMPORTANTE: Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido. Nada más. Sin explicaciones. Sin texto antes o después. Sin markdown. Sin bloques de código. Solo el JSON puro.

Ejemplo de respuesta correcta:
{"products":[{"name":"Coca-Cola 500ml","brand":"Coca-Cola","category":"Bebidas sin Alcohol","salePrice":1200,"purchasePrice":800,"unit":"unidad","confidence":0.9,"warnings":[]}],"detectedText":"Coca-Cola 500ml $1.200"}

Formato exacto de salida:
{"products":[{"name":"string","brand":"string|null","category":"string","salePrice":0,"purchasePrice":0,"unit":"string","confidence":0.0,"warnings":["string"]}],"detectedText":"string"}

Reglas para cada campo:

name: Nombre completo del producto incluyendo marca, variedad, tamaño. Ej: "Pepsi Black 500ml", "Aceite Cocinero 900ml". Copiar EXACTAMENTE como se ve. Si no se lee bien, usar tu mejor interpretación.

brand: Marca visible (Coca-Cola, Pepsi, Danone, La Serenísima, etc). Si no se ve → null.

category: Usar EXACTAMENTE una de estas categorías del sistema:
- "Bebidas Alcohólicas" (vinos, cervezas, licores, destilados, aperitivos)
- "Bebidas sin Alcohol" (gaseosas, jugos, aguas, energizantes, té, café)
- "Lácteos" (leche, yogures, queso, manteca, crema, postres lácteos)
- "Cuidado del Cabello" (shampoo, acondicionador, tratamientos, tinturas, fijadores)
- "Cuidado de la Piel" (cremas corporales, faciales, protectores solares, jabones)
- "Higiene Personal" (desodorantes, pasta dental, cepillos, enjuagues, papel higiénico)
- "Afeitado y Depilación" (maquinitas, espuma, aftershave, ceras)
- "Medicamentos" (analgésicos, antigripales, digestivos, vitaminas, primeros auxilios)
- "Bebé" (pañales, toallitas, alimentos bebé, cuidado bebé)
- "Golosinas y Snacks" (chocolates, caramelos, galletitas, alfajores, papas fritas)
- "Panadería y Repostería" (pan, facturas, tortas, masas)
- "Almacén" (arroz, pastas, harinas, aceites, conservas, condimentos, sopas, cereales, legumbres)
- "Carnes y Pescados" (carnes rojas, pollo, pescados, embutidos, fiambres)
- "Frutas y Verduras" (frutas, verduras, frutas secas)
- "Congelados" (helados, comidas congeladas, vegetales congelados)
- "Limpieza" (detergentes, lavandina, limpiadores, desinfectantes, suavizantes, esponjas)
- "Bazar y Hogar" (utensilios cocina, organizadores, iluminación, pilas, baterías)
- "Indumentaria" (ropa hombre, mujer, niños, calzado, accesorios)
- "Kiosco" (cigarrillos, diarios, revistas, librería, juguetes)
- "Mascotas" (alimento perros, gatos, accesorios mascotas, higiene mascotas)
- "Jardinería" (plantas, fertilizantes, herramientas jardín, macetas)
- "Ferretería" (herramientas, pinturas, electricidad, plomería, tornillos)
- "Automotor" (aceites lubricantes, accesorios auto, limpieza auto, bicicletas)
- "Electrónica" (celulares, computación, audio, fotografía, accesorios tech)
- "Electrodomésticos" (cocina, refrigeración, lavado, climatización, pequeños electrodomésticos)

Si no encaja en ninguna categoría, usar "Almacén" como fallback.

salePrice: Precio de venta en pesos argentinos. Formato numérico sin símbolo $ (ej: 1200, no "1.200" ni "$1200"). Si hay dos precios, este es el MAYOR.

purchasePrice: Precio de costo. Si hay dos precios, este es el MENOR. Si solo hay uno → 0.

unit: "unidad", "kg", "litro", "pack", "docena". Si no se detecta → "unidad".

confidence: Nivel de certeza de 0.0 a 1.0:
- 1.0 = texto y precio perfectamente legibles
- 0.8 = legible con pequeñas imperfecciones
- 0.6 = parcialmente legible, algunos datos dudosos
- 0.4 = apenas se distingue algo
- 0.2 = muy borroso, casi no se lee

warnings: Array de strings con advertencias. Ejemplos: ["precio borroso", "nombre parcialmente ilegible", "iluminación baja", "imagen cortada"]. Si no hay → array vacío [].

REGLAS ANTE IMÁGENES CON PROBLEMAS:
- Iluminación baja: Incluir productos con confidence bajo (0.3-0.5). Es mejor detectar algo que nada.
- Imagen borrosa: Usar contexto (colores de marca, formas de botellas) para adivinar nombres. Marcar confidence bajo.
- Texto cortado: Incluir lo que se pueda leer. Añadir warning "imagen cortada".
- Múltiples productos apilados: Detectar todos los visibles, aunque estén parcialmente ocultos.

NUNCA devolver un array vacío si hay ALGO visible en la imagen.
Si absolutamente no se ve nada, devolver: {"products":[],"detectedText":"no se detectó contenido"}

PROHIBIDO:
- Texto fuera del JSON
- Explicaciones o comentarios
- Markdown o bloques de código
- Campos como "id", "_sourceEngines", "_consensusVotes" (solo los campos del formato)
- Valores string para precios (siempre número)

Recordá: SOLO el JSON. Nada más.`;

const tryFixAndParse = (str) => {
  if (!str || typeof str !== 'string') return null;
  let s = str.trim();
  if (!s) return null;

  try { const r = JSON.parse(s); if (r && typeof r === 'object') return r; } catch (_) {}

  s = s
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']')
    .replace(/'/g, '"')
    .replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":')
    .replace(/:\s*"([^"]*)"([^,\}\]])/g, (m, v, rest) => {
      if (rest.trim().startsWith(',') || rest.trim().startsWith('}') || rest.trim().startsWith(']')) return m;
      return m;
    });
  try { const r = JSON.parse(s); if (r && typeof r === 'object') return r; } catch (_) {}

  s = s.replace(/([{,])\s*(\w+)\s*:\s*([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)/g, (m, pre, key, val) => {
    const lower = val.toLowerCase();
    if (lower === 'null') return `${pre}"${key}":null`;
    if (lower === 'true') return `${pre}"${key}":true`;
    if (lower === 'false') return `${pre}"${key}":false`;
    return `${pre}"${key}":"${val}"`;
  });
  try { const r = JSON.parse(s); if (r && typeof r === 'object') return r; } catch (_) {}

  return null;
};

const extractJsonFromText = (text) => {
  if (!text) return null;

  let cleaned = text
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/im, '')
    .replace(/^[^{[]*/, '')
    .replace(/[^}\]]*$/, '')
    .trim();

  let result = tryFixAndParse(cleaned);
  if (result) return result;

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    result = tryFixAndParse(cleaned.slice(start, end + 1));
    if (result) return result;
  }

  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    const wrapped = `{"products":${cleaned.slice(arrayStart, arrayEnd + 1)},"detectedText":""}`;
    result = tryFixAndParse(wrapped);
    if (result) return result;
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    result = tryFixAndParse(jsonMatch[0]);
    if (result) return result;
  }

  return null;
};

const parseCandidatesJson = (data) => {
  try {
    const c = data?.candidates?.[0];

    if (!c) {
      console.error(`[gemini] parseCandidatesJson - NO CANDIDATES. Keys: ${Object.keys(data || {})}, error: ${JSON.stringify(data?.error || null)}, promptFeedback: ${JSON.stringify(data?.promptFeedback || null)}`);
      return { obj: null, rawText: null };
    }

    const finishReason = c.finishReason || 'UNKNOWN';
    const parts = c?.content?.parts || [];

    console.log(`[gemini] parseCandidatesJson - finishReason=${finishReason}, partsCount=${parts.length}`);

    let s = '';
    let thinkingText = '';
    for (const p of parts) {
      if (p.thinking) {
        thinkingText += p.thinking;
        continue;
      }
      if (p.text) s += p.text;
    }

    if (thinkingText) {
      console.log(`[gemini] Thinking (${thinkingText.length} chars): ${thinkingText.slice(0, 500)}`);
    }

    s = String(s).trim();

    if (s.length > 0) {
      console.log(`[gemini] Response text (${s.length} chars): ${s.slice(0, 1500)}`);
    } else {
      console.warn(`[gemini] EMPTY TEXT. Parts:`, JSON.stringify(parts.map(p => ({
        hasText: !!p.text, textLen: (p.text||'').length,
        hasThinking: !!p.thinking, thinkingLen: (p.thinking||'').length,
      }))));
    }

    if (!s) return { obj: null, rawText: thinkingText || null };

    const obj = extractJsonFromText(s);
    if (obj) {
      console.log(`[gemini] ✓ JSON parsed. Products: ${Array.isArray(obj.products) ? obj.products.length : 'N/A'}`);
      return { obj, rawText: s };
    }

    console.warn(`[gemini] FAILED TO PARSE. Full text: ${s.slice(0, 3000)}`);
    return { obj: null, rawText: s };
  } catch (e) {
    console.error(`[gemini] EXCEPTION: ${e.message}`, e.stack);
    return { obj: null, rawText: null };
  }
};

const mapToProducts = (raw) => {
  if (!raw || typeof raw !== 'object') return { products: [], detectedText: '' };

  let rawProducts = [];
  if (Array.isArray(raw.products)) rawProducts = raw.products;
  else if (Array.isArray(raw.productos)) rawProducts = raw.productos;
  else if (Array.isArray(raw.items)) rawProducts = raw.items;
  else if (Array.isArray(raw)) rawProducts = raw;

  const detectedText = raw.detectedText || raw.detected_text || raw.textoDetectado || '';

  const validCategories = [
    'Bebidas Alcohólicas', 'Bebidas sin Alcohol', 'Lácteos',
    'Cuidado del Cabello', 'Cuidado de la Piel', 'Higiene Personal', 'Afeitado y Depilación',
    'Medicamentos', 'Bebé',
    'Golosinas y Snacks', 'Panadería y Repostería', 'Almacén', 'Carnes y Pescados',
    'Frutas y Verduras', 'Congelados',
    'Limpieza', 'Bazar y Hogar',
    'Indumentaria', 'Kiosco', 'Mascotas', 'Jardinería', 'Ferretería', 'Automotor',
    'Electrónica', 'Electrodomésticos'
  ];
  const categoryMap = {
    'bebidas': 'Bebidas sin Alcohol', 'gaseosas': 'Bebidas sin Alcohol', 'jugos': 'Bebidas sin Alcohol',
    'aguas': 'Bebidas sin Alcohol', 'cervezas': 'Bebidas Alcohólicas', 'vinos': 'Bebidas Alcohólicas',
    'licores': 'Bebidas Alcohólicas', 'destilados': 'Bebidas Alcohólicas', 'aperitivos': 'Bebidas Alcohólicas',
    'te': 'Bebidas sin Alcohol', 'cafe': 'Bebidas sin Alcohol', 'café': 'Bebidas sin Alcohol',
    'energizantes': 'Bebidas sin Alcohol', 'energéticas': 'Bebidas sin Alcohol',
    'leche': 'Lácteos', 'yogures': 'Lácteos', 'queso': 'Lácteos', 'quesos': 'Lácteos',
    'manteca': 'Lácteos', 'crema': 'Lácteos', 'lacteos': 'Lácteos', 'lácteos': 'Lácteos',
    'shampoo': 'Cuidado del Cabello', 'acondicionador': 'Cuidado del Cabello',
    'jabones': 'Cuidado de la Piel', 'cremas': 'Cuidado de la Piel', 'protectores solares': 'Cuidado de la Piel',
    'desodorante': 'Higiene Personal', 'desodorantes': 'Higiene Personal',
    'pasta dental': 'Higiene Personal', 'cepillo': 'Higiene Personal', 'papel higienico': 'Higiene Personal',
    'higiene': 'Higiene Personal', 'cuidado personal': 'Higiene Personal',
    'afeitado': 'Afeitado y Depilación', 'depilacion': 'Afeitado y Depilación',
    'medicamentos': 'Medicamentos', 'analgesicos': 'Medicamentos', 'vitaminas': 'Medicamentos',
    'panales': 'Bebé', 'pañales': 'Bebé', 'bebe': 'Bebé', 'bebé': 'Bebé',
    'golosinas': 'Golosinas y Snacks', 'snacks': 'Golosinas y Snacks', 'chocolates': 'Golosinas y Snacks',
    'galletitas': 'Golosinas y Snacks', 'alfajores': 'Golosinas y Snacks', 'caramelos': 'Golosinas y Snacks',
    'pan': 'Panadería y Repostería', 'panaderia': 'Panadería y Repostería', 'reposteria': 'Panadería y Repostería',
    'tortas': 'Panadería y Repostería', 'facturas': 'Panadería y Repostería',
    'alimentos': 'Almacén', 'comida': 'Almacén', 'comestibles': 'Almacén', 'abarrotes': 'Almacén',
    'arroz': 'Almacén', 'pasta': 'Almacén', 'harina': 'Almacén', 'aceite': 'Almacén', 'aceites': 'Almacén',
    'conservas': 'Almacén', 'condimentos': 'Almacén', 'sopas': 'Almacén', 'cereales': 'Almacén',
    'legumbres': 'Almacén', 'almacen': 'Almacén', 'fiambres': 'Carnes y Pescados',
    'carnes': 'Carnes y Pescados', 'pollo': 'Carnes y Pescados', 'pescado': 'Carnes y Pescados',
    'pescados': 'Carnes y Pescados', 'embutidos': 'Carnes y Pescados',
    'frutas': 'Frutas y Verduras', 'verduras': 'Frutas y Verduras', 'fruta': 'Frutas y Verduras',
    'congelados': 'Congelados', 'helados': 'Congelados',
    'limpieza': 'Limpieza', 'detergentes': 'Limpieza', 'lavandina': 'Limpieza', 'aseo': 'Limpieza',
    'limpiadores': 'Limpieza', 'desinfectantes': 'Limpieza',
    'bazar': 'Bazar y Hogar', 'cocina': 'Bazar y Hogar', 'organizadores': 'Bazar y Hogar',
    'indumentaria': 'Indumentaria', 'ropa': 'Indumentaria', 'calzado': 'Indumentaria',
    'kiosco': 'Kiosco', 'cigarrillos': 'Kiosco', 'diarios': 'Kiosco', 'libreria': 'Kiosco',
    'mascotas': 'Mascotas', 'perros': 'Mascotas', 'gatos': 'Mascotas',
    'jardineria': 'Jardinería', 'plantas': 'Jardinería', 'fertilizantes': 'Jardinería',
    'ferreteria': 'Ferretería', 'herramientas': 'Ferretería', 'pinturas': 'Ferretería',
    'automotor': 'Automotor', 'auto': 'Automotor', 'bicicletas': 'Automotor',
    'electronica': 'Electrónica', 'electrónica': 'Electrónica', 'tecnologia': 'Electrónica',
    'celulares': 'Electrónica', 'computacion': 'Electrónica', 'audio': 'Electrónica',
    'electrodomesticos': 'Electrodomésticos', 'electrodomésticos': 'Electrodomésticos',
    'refrigeracion': 'Electrodomésticos', 'lavado': 'Electrodomésticos',
  };

  const products = rawProducts
    .filter(p => p && typeof p === 'object')
    .filter(p => {
      const hasName = p.name || p.nombre || p.producto;
      const hasPrice = parseNumber(p.salePrice) || parseNumber(p.precio) || parseNumber(p.price) || 0;
      return hasName || hasPrice > 0;
    })
    .map((p, i) => {
      const rawName = p.name || p.nombre || p.producto || p.descripcion || '';
      const rawCategory = String(p.category || p.categoria || '').trim();
      const normalizedCategory = categoryMap[rawCategory.toLowerCase()] ||
        (validCategories.includes(rawCategory) ? rawCategory : 'Almacén');

      const sp = parseNumber(p.salePrice) || parseNumber(p.precio) || parseNumber(p.price) || 0;
      const pp = parseNumber(p.purchasePrice) || parseNumber(p.precioCosto) || parseNumber(p.precio_costo) || 0;
      const conf = parseNumber(p.confidence) || parseNumber(p.confianza) || 0.5;

      const warnings = [];
      if (Array.isArray(p.warnings)) warnings.push(...p.warnings);
      if (Array.isArray(p.advertencias)) warnings.push(...p.advertencias);
      if (sp === 0) warnings.push('Sin precio detectado');
      if (conf < 0.5) warnings.push('Baja confianza en la lectura');
      if (rawName.length < 2) warnings.push('Nombre muy corto o ilegible');

      return {
        id: `gemini-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        name: normalizeValue(rawName) || `Producto sin nombre #${i + 1}`,
        brand: normalizeValue(p.brand || p.marca),
        category: normalizedCategory,
        salePrice: sp,
        purchasePrice: pp,
        unit: normalizeValue(p.unit || p.unidad) || 'unidad',
        confidence: Math.min(1, Math.max(0.1, conf)),
        warnings,
      };
    });

  return { products, detectedText };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const callModel = async (modelName, apiVersion, imageBase64, mimeType) => {
  const key = getApiKey();
  if (!key) throw new Error('Falta GEMINI_API_KEY');

  const url = `${GEMINI_BASE_URL}/${apiVersion}/models/${modelName}:generateContent?key=${key}`;

  const body = {
    contents: [{
      role: 'user',
      parts: [
        { text: OCR_PROMPT },
        { inline_data: { mime_type: mimeType, data: imageBase64 } },
      ],
    }],
    generationConfig: { temperature: 0, maxOutputTokens: 16384 },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const resText = await res.text();
    let data;
    try { data = JSON.parse(resText); } catch { data = {}; }

    console.log(`[gemini] HTTP ${res.status}, bodyLength=${resText.length}, parsedKeys=${Object.keys(data || {})}`);
    if (data?.candidates) {
      console.log(`[gemini] candidates count=${data.candidates.length}, first candidate keys=${Object.keys(data.candidates[0] || {})}`);
    }
    if (data?.error) {
      console.error(`[gemini] ERROR in response:`, JSON.stringify(data.error).slice(0, 500));
    }
    if (resText.length > 0 && resText.length < 3000) {
      console.log(`[gemini] Full response: ${resText}`);
    } else if (resText.length > 0) {
      console.log(`[gemini] Response preview: ${resText.slice(0, 2000)}`);
    }

    if (!res.ok) {
      const errMsg = data?.error?.message || `HTTP ${res.status}`;
      console.error(`[gemini] HTTP ERROR: status=${res.status}, message=${errMsg}`);
      if (data?.error) console.error(`[gemini] Error details:`, JSON.stringify(data.error).slice(0, 500));
      const err = new Error(errMsg);
      err.status = res.status;
      err.responseData = data;
      throw err;
    }

    const finishReason = data?.candidates?.[0]?.finishReason || 'UNKNOWN';
    const safetyRatings = data?.candidates?.[0]?.safetyRatings || [];
    const blocked = safetyRatings.filter(r => r.blocked).map(r => `${r.category}=${r.probability}`);
    const textLength = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').length;

    console.log(`[gemini] ${modelName} (${apiVersion}): status=${res.status}, finishReason=${finishReason}, blocked=${blocked.join(',') || 'none'}, textLength=${textLength}`);

    if (blocked.length > 0) {
      console.warn(`[gemini] ⚠ Contenido bloqueado por safety: ${blocked.join(', ')}`);
    }

    if (finishReason !== 'STOP') {
      console.warn(`[gemini] ⚠ Finish reason inesperado: ${finishReason}`);
    }

    const parsed = parseCandidatesJson(data);
    if (!parsed.obj) {
      console.error(`[gemini] PARSE_ERROR - raw text: ${(parsed.rawText || '').slice(0, 2000)}`);
      return {
        provider: 'gemini',
        model: modelName,
        apiVersion,
        durationMs: 0,
        productCount: 0,
        avgConfidence: 0,
        products: [],
        detectedText: parsed.rawText || '',
        warnings: ['No se pudo procesar la respuesta de Gemini como JSON válido'],
        parseError: true,
        rawResponse: (parsed.rawText || '').slice(0, 3000),
      };
    }

    let mapped;
    try {
      mapped = mapToProducts(parsed.obj);
    } catch (mapErr) {
      console.error(`[gemini] mapToProducts error: ${mapErr.message}`, mapErr.stack);
      console.error(`[gemini] Raw parsed object:`, JSON.stringify(parsed.obj).slice(0, 2000));
      return {
        provider: 'gemini',
        model: modelName,
        apiVersion,
        durationMs: 0,
        productCount: 0,
        avgConfidence: 0,
        products: [],
        detectedText: '',
        warnings: ['Error al procesar los productos detectados'],
        parseError: true,
        rawResponse: JSON.stringify(parsed.obj).slice(0, 3000),
      };
    }

    return mapped;
  } finally {
    clearTimeout(timer);
  }
};

export const getGeminiHealth = () => {
  const key = getApiKey();
  return {
    configured: Boolean(key),
    keyPreview: key ? key.substring(0, 8) + '...' : null,
    keyLength: key.length,
    models: MODEL_FALLBACK_CHAIN.map(m => `${m.model} (${m.apiVersion})`),
    baseUrl: GEMINI_BASE_URL,
    message: key ? `Gemini listo` : 'GEMINI_API_KEY no encontrada en server/.env',
  };
};

export const analyzeWithGemini = async (file) => {
  const key = getApiKey();
  if (!key) {
    throw new Error('GEMINI_API_KEY no encontrada. Creá server/.env con: GEMINI_API_KEY=tu_key');
  }

  const imageBase64 = file.buffer.toString('base64');
  const mimeType = file.mimetype || 'image/jpeg';

  console.log(`[gemini] Key: ${key.substring(0, 8)}... (${key.length} chars)`);
  console.log(`[gemini] Imagen: ${(file.buffer.length / 1024).toFixed(1)}KB, tipo: ${mimeType}`);

  const t0 = Date.now();
  const errors = [];

  for (const { model, apiVersion } of MODEL_FALLBACK_CHAIN) {
    try {
      console.log(`[gemini] → ${model} (${apiVersion})...`);
      const result = await callModel(model, apiVersion, imageBase64, mimeType);
      const durationMs = Date.now() - t0;

      console.log(`[gemini] ✓ ${model} (${apiVersion}) → ${result.products.length} prod, ${(durationMs / 1000).toFixed(1)}s`);
      if (result.products.length > 0) {
        console.log(`[gemini] Primeros 3 productos:`, JSON.stringify(result.products.slice(0, 3), null, 2));
      } else {
        console.warn(`[gemini] ⚠ No se detectaron productos. warnings:`, result.warnings);
      }

      return {
        provider: 'gemini',
        model,
        apiVersion,
        durationMs,
        productCount: result.products.length,
        avgConfidence: result.products.length > 0
          ? Math.round(result.products.reduce((s, p) => s + p.confidence, 0) / result.products.length * 100) / 100
          : 0,
        products: result.products,
        detectedText: result.detectedText || '',
        warnings: result.warnings || (result.products.length === 0
          ? ['No se detectaron productos en la imagen. Probá con una imagen más clara o con mejor iluminación.']
          : []),
        ...(result.parseError && { parseError: true, rawResponse: result.rawResponse }),
      };
    } catch (err) {
      const msg = err.message || String(err);
      const status = err.status || 0;
      const code = err.code || '';

      const is429 = status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('exceeded') || msg.includes('RATE_LIMIT');
      const is404 = status === 404 || status === 400 || msg.includes('404') || msg.includes('not found') || msg.includes('not available') || msg.includes('not supported');
      const isAuth = status === 403 || status === 401 || msg.includes('API_KEY') || msg.includes('not valid');

      console.error(`[gemini] ✗ ${model} (${apiVersion}): status=${status}, is429=${is429}, is404=${is404}, isAuth=${isAuth}`);
      console.error(`[gemini]   message: ${msg.substring(0, 500)}`);

      errors.push({ model, apiVersion, error: msg, status });

      if (isAuth) {
        console.error(`[gemini] ❌ Error de autenticación. Verificá la API key.`);
        break;
      }
      if (is429) {
        console.warn(`[gemini] ⏳ Rate limited. Esperando 3s...`);
        await sleep(3000);
        continue;
      }
      if (is404) continue;
    }
  }

  const last = errors[errors.length - 1];
  const hasAuth = errors.some(e => e.status === 403 || e.status === 401);
  const all429 = !hasAuth && errors.filter(e => e.status).every(e => e.status === 429);

  let userMessage;
  if (hasAuth) {
    userMessage = `API key inválida (${key.substring(0, 8)}...). Obtene una key en https://aistudio.google.com/apikey`;
  } else if (all429) {
    userMessage = `Sin cuota en Gemini. Esperá un momento y reintentá`;
  } else {
    userMessage = `Gemini: ${last ? last.error.substring(0, 200) : 'todos los modelos fallaron'}`;
  }

  console.error(`[gemini] Todos los modelos fallaron. Error final: ${userMessage}`);
  console.error(`[gemini] Errores:`, JSON.stringify(errors.map(e => ({ model: e.model, status: e.status, error: e.error.substring(0, 200) })), null, 2));

  return {
    provider: 'gemini',
    model: null,
    apiVersion: null,
    durationMs: Date.now() - t0,
    productCount: 0,
    avgConfidence: 0,
    products: [],
    detectedText: '',
    warnings: [userMessage],
    error: userMessage,
  };
};
