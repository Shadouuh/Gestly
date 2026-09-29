const COLOR_KEYS = [
  'violet',
  'blue',
  'amber',
  'pink',
  'rose',
  'cyan',
  'slate',
  'red',
  'yellow',
  'orange',
  'emerald',
  'green',
  'sky',
  'indigo',
  'fuchsia',
  'lime',
  'gray',
  'teal',
  'purple',
  'zinc',
];

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const extractCategoryColorKey = (value, fallback = 'blue') => {
  if (!value || typeof value !== 'string') return fallback;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;

  const directMatch = COLOR_KEYS.find((color) => color === normalized);
  if (directMatch) return directMatch === 'purple' ? 'violet' : directMatch;

  const embeddedMatch = COLOR_KEYS.find((color) => normalized.includes(color));
  if (!embeddedMatch) return fallback;

  return embeddedMatch === 'purple' ? 'violet' : embeddedMatch;
};

export const getProductTotalStock = (product) => {
  if (!product) return 0;

  if (product.stock !== undefined && product.stock !== null && product.variants?.length === 0) {
    return toNumber(product.stock);
  }

  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    return toNumber(product.stock);
  }

  return product.variants.reduce((productSum, variant) => {
    const inventories = Array.isArray(variant?.inventories) ? variant.inventories : [];
    const variantStock = inventories.reduce(
      (inventorySum, inventory) => inventorySum + toNumber(inventory?.stock),
      0
    );

    if (inventories.length > 0) return productSum + variantStock;
    return productSum + toNumber(variant?.stock);
  }, 0);
};

export const normalizeProductFromApi = (inputProduct) => {
  if (!inputProduct || typeof inputProduct !== 'object') return null;

  const nestedProduct = inputProduct.product && typeof inputProduct.product === 'object'
    ? inputProduct.product
    : {};
  const categoryObject = inputProduct.category && typeof inputProduct.category === 'object'
    ? inputProduct.category
    : nestedProduct.category && typeof nestedProduct.category === 'object'
      ? nestedProduct.category
      : null;

  const variants = Array.isArray(inputProduct.variants)
    ? inputProduct.variants
    : Array.isArray(nestedProduct.variants)
      ? nestedProduct.variants
      : [];

  const normalized = {
    ...nestedProduct,
    ...inputProduct,
    id: inputProduct.id ?? inputProduct.productId ?? nestedProduct.id ?? null,
    businessId: inputProduct.businessId ?? inputProduct.business_id ?? nestedProduct.businessId ?? nestedProduct.business_id ?? null,
    name: inputProduct.name ?? nestedProduct.name ?? '',
    price: toNumber(inputProduct.price ?? inputProduct.sale_price ?? nestedProduct.price ?? nestedProduct.sale_price),
    purchasePrice: toNumber(
      inputProduct.purchasePrice
      ?? inputProduct.purchase_price
      ?? nestedProduct.purchasePrice
      ?? nestedProduct.purchase_price
    ),
    imageUrl: inputProduct.imageUrl
      ?? inputProduct.image_url
      ?? inputProduct.image
      ?? nestedProduct.imageUrl
      ?? nestedProduct.image_url
      ?? nestedProduct.image
      ?? null,
    categoryId: inputProduct.categoryId
      ?? inputProduct.category_id
      ?? nestedProduct.categoryId
      ?? nestedProduct.category_id
      ?? categoryObject?.id
      ?? null,
    categoryName: inputProduct.categoryName
      ?? inputProduct.category_name
      ?? nestedProduct.categoryName
      ?? nestedProduct.category_name
      ?? categoryObject?.name
      ?? (typeof nestedProduct.category === 'string' ? nestedProduct.category : null)
      ?? 'General',
    categoryIcon: inputProduct.categoryIcon
      ?? inputProduct.category_icon
      ?? nestedProduct.categoryIcon
      ?? nestedProduct.category_icon
      ?? categoryObject?.icon
      ?? null,
    categoryColor: extractCategoryColorKey(
      inputProduct.categoryColor
      ?? inputProduct.category_color
      ?? nestedProduct.categoryColor
      ?? nestedProduct.category_color
      ?? categoryObject?.color
      ?? 'blue'
    ),
    unit: inputProduct.unit ?? nestedProduct.unit ?? null,
    isActive: Boolean(inputProduct.isActive ?? inputProduct.active ?? nestedProduct.isActive ?? nestedProduct.active ?? true),
    variants,
  };

  normalized.stock = getProductTotalStock({
    stock: inputProduct.stock ?? nestedProduct.stock ?? 0,
    variants,
  });
  normalized.image = normalized.imageUrl;
  normalized.useIcon = !normalized.imageUrl;

  return normalized.id ? normalized : null;
};
