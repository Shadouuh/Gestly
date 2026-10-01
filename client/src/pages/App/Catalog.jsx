import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search, Plus, Package, X, Grid3X3, List, Loader2, Edit3, Save, Camera, RefreshCw,
  AlertTriangle, DollarSign, ShoppingBag, TrendingUp, TrendingDown, Tag, Hash, Eye,
  Wine, Beer, Coffee, Milk, Droplets, Sparkles, SprayCan, Scissors, Heart, Pill,
  Cookie, Candy, Apple, Beef, Snowflake, Home, Shirt, ShoppingBag as ShoppingBagIcon,
  Dog, Flower2, Hammer, Car, Smartphone, WashingMachine, Croissant, Cake, Baby,
  GalleryThumbnails, ChevronDown, FileText
} from 'lucide-react';
import api, { resolveAssetUrl } from '../../services/api';
import { getCurrentBusiness } from '../../services/api';
import ImportFromPhoto from '../../shared/components/ImportFromPhoto';
import ProductImagePicker from './components/ProductImagePicker';
import { getProductTotalStock, normalizeProductFromApi } from '../../shared/utils/productNormalization';

const ICON_MAP = { Wine, Beer, Coffee, Milk, Droplets, Sparkles, SprayCan, Scissors, Heart, Pill, Cookie, Candy, Apple, Beef, Snowflake, Home, Shirt, ShoppingBag: ShoppingBagIcon, Dog, Flower2, Hammer, Car, Smartphone, WashingMachine, Package, Tag, Croissant, Cake, Baby };

const getIconComponent = (iconName) => {
  if (!iconName) return Tag;
  return ICON_MAP[iconName] || Tag;
};

const CAT_COLOR_MAP = {
  violet: { bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500', solid: '#8b5cf6', ring: 'ring-violet-200 dark:ring-violet-800' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500', solid: '#3b82f6', ring: 'ring-blue-200 dark:ring-blue-800' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', solid: '#f59e0b', ring: 'ring-amber-200 dark:ring-amber-800' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', dot: 'bg-pink-500', solid: '#ec4899', ring: 'ring-pink-200 dark:ring-pink-800' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500', solid: '#f43f5e', ring: 'ring-rose-200 dark:ring-rose-800' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500', solid: '#06b6d4', ring: 'ring-cyan-200 dark:ring-cyan-800' },
  slate: { bg: 'bg-slate-100 dark:bg-slate-700/50', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500', solid: '#64748b', ring: 'ring-slate-200 dark:ring-slate-700' },
  red: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500', solid: '#ef4444', ring: 'ring-red-200 dark:ring-red-800' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500', solid: '#eab308', ring: 'ring-yellow-200 dark:ring-yellow-800' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500', solid: '#f97316', ring: 'ring-orange-200 dark:ring-orange-800' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', solid: '#10b981', ring: 'ring-emerald-200 dark:ring-emerald-800' },
  green: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500', solid: '#22c55e', ring: 'ring-green-200 dark:ring-green-800' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-300', dot: 'bg-sky-500', solid: '#0ea5e9', ring: 'ring-sky-200 dark:ring-sky-800' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500', solid: '#6366f1', ring: 'ring-indigo-200 dark:ring-indigo-800' },
  fuchsia: { bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30', text: 'text-fuchsia-700 dark:text-fuchsia-300', dot: 'bg-fuchsia-500', solid: '#d946ef', ring: 'ring-fuchsia-200 dark:ring-fuchsia-800' },
  lime: { bg: 'bg-lime-50 dark:bg-lime-900/30', text: 'text-lime-700 dark:text-lime-300', dot: 'bg-lime-500', solid: '#84cc16', ring: 'ring-lime-200 dark:ring-lime-800' },
  gray: { bg: 'bg-gray-50 dark:bg-gray-700/50', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-500', solid: '#6b7280', ring: 'ring-gray-200 dark:ring-gray-700' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', dot: 'bg-teal-500', solid: '#14b8a6', ring: 'ring-teal-200 dark:ring-teal-800' },
};

const getCatStyle = (colorName) => CAT_COLOR_MAP[colorName] || CAT_COLOR_MAP.blue;
const toRgba = (hex, alpha) => {
  const value = hex.replace('#', '');
  const normalized = value.length === 3
    ? value.split('').map((char) => char + char).join('')
    : value;
  const int = Number.parseInt(normalized, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getTotalStock = getProductTotalStock;

const normalizeBranchId = (branchId) => (branchId === undefined || branchId === null ? 'all' : String(branchId));

const getBranchInventories = (product, branchId) => {
  const normalizedBranchId = normalizeBranchId(branchId);
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.flatMap((variant) =>
    (Array.isArray(variant?.inventories) ? variant.inventories : []).filter((inventory) =>
      normalizedBranchId === 'all' ? true : normalizeBranchId(inventory?.branchId) === normalizedBranchId
    )
  );
};

const getProductStockForBranch = (product, branchId) => {
  const normalizedBranchId = normalizeBranchId(branchId);
  if (normalizedBranchId === 'all') return getTotalStock(product);

  return getBranchInventories(product, normalizedBranchId).reduce(
    (sum, inventory) => sum + Number(inventory?.stock || 0),
    0
  );
};

const getProductMinStockForBranch = (product, branchId) => {
  const normalizedBranchId = normalizeBranchId(branchId);
  if (normalizedBranchId === 'all') return 10;

  const inventories = getBranchInventories(product, normalizedBranchId);
  if (inventories.length === 0) return 0;
  return inventories.reduce((max, inventory) => Math.max(max, Number(inventory?.minStock || 0)), 0);
};

const isProductVisibleInBranch = (product, branchId) => {
  const normalizedBranchId = normalizeBranchId(branchId);
  if (normalizedBranchId === 'all') return true;
  return getBranchInventories(product, normalizedBranchId).length > 0;
};

const CategoryBadge = ({ product }) => {
  const iconName = product.categoryIcon || null;
  const colorName = product.categoryColor || 'blue';
  const Icon = iconName ? getIconComponent(iconName) : Tag;
  const style = getCatStyle(colorName);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide uppercase ${style.bg} ${style.text}`}>
      <Icon size={10} />{product.categoryName || 'General'}
    </span>
  );
};

const StockBadge = ({ stock, mode }) => {
  if (mode === 'simple') {
    if (stock === 0) return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Agotado</span>;
    return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Disponible</span>;
  }
  if (stock === 0) return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Sin stock</span>;
  if (stock <= 10) return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{stock} uds</span>;
  return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{stock} uds</span>;
};

const Catalog = () => {
  const { selectedBranch = 'all', branches: outletBranches = [] } = useOutletContext() || {};
  const [businessId, setBusinessId] = useState(() => getCurrentBusiness()?.id || null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [stockMode, setStockMode] = useState(() => localStorage.getItem('catalogStockMode') || 'numeric');
  const [showPrices, setShowPrices] = useState(() => localStorage.getItem('catalogShowPrices') !== 'false');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalTab, setAddModalTab] = useState('general');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    salePrice: '',
    purchasePrice: '',
    categoryId: '',
    imageUrl: '',
    unit: 'uds',
    branchIds: [],
    branchStocks: {},
  });
  const [saving, setSaving] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const mountedRef = useRef(true);
  const lastSilentRefreshAtRef = useRef(0);

  const branchOptions = useMemo(
    () => (Array.isArray(outletBranches) ? outletBranches.filter((branch) => normalizeBranchId(branch?.id) !== 'all') : []),
    [outletBranches]
  );
  const normalizedSelectedBranch = normalizeBranchId(selectedBranch);
  const currentBranchName = useMemo(() => {
    if (normalizedSelectedBranch === 'all') return 'Todas las sucursales';
    return branchOptions.find((branch) => normalizeBranchId(branch.id) === normalizedSelectedBranch)?.name || 'Sucursal';
  }, [branchOptions, normalizedSelectedBranch]);

  const buildNewProductState = useCallback(() => {
    const defaultBranchIds = normalizedSelectedBranch !== 'all'
      ? [normalizedSelectedBranch]
      : branchOptions.map((branch) => normalizeBranchId(branch.id));

    const branchStocks = branchOptions.reduce((acc, branch) => {
      acc[normalizeBranchId(branch.id)] = {
        current_stock: '',
        minimum_stock: '',
      };
      return acc;
    }, {});

    return {
      name: '',
      salePrice: '',
      purchasePrice: '',
      categoryId: '',
      imageUrl: '',
      branchIds: defaultBranchIds,
      branchStocks,
    };
  }, [branchOptions, normalizedSelectedBranch]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;

    api.get(`/categories?businessId=${businessId}`)
      .then((response) => {
        if (cancelled) return;
        const rows = Array.isArray(response.data) ? response.data : [];
        setDbCategories(rows);
      })
      .catch((error) => {
        console.error(error);
        if (cancelled) return;
        setDbCategories([]);
      });

    return () => { cancelled = true; };
  }, [businessId]);

  useEffect(() => {
    const b = getCurrentBusiness();
    setBusinessId((prev) => prev ?? b?.id ?? null);
  }, []);

  const loadProducts = useCallback(async (options = {}) => {
    const { silent = false } = options;
    if (!businessId) {
    if (mountedRef.current) setLoading(false);
    return;
  }
  if (mountedRef.current) {
    if (silent) setIsRefreshing(true);
    else setLoading(true);
  }
  if (!silent) setError(null);
  try {
    const r = await api.get(`/businesses/${businessId}/products`);
    const data = Array.isArray(r.data) ? r.data : [];
    const normalized = data.map(normalizeProductFromApi).filter(Boolean);
    if (mountedRef.current) {
      setProducts(normalized);
      setLastSyncAt(new Date());
      setError(null);
    }
  } catch (e) {
    if (mountedRef.current && !silent) setError('Error al cargar productos. Verificá la conexión.');
  } finally {
    if (mountedRef.current) {
      setLoading(false);
      setIsRefreshing(false);
    }
  }
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    loadProducts({ silent: false });
  }, [businessId, loadProducts]);
  useEffect(() => {
    setNewProduct(buildNewProductState());
  }, [buildNewProductState]);

  useEffect(() => {
    if (!businessId) return undefined;

    const triggerSilentRefresh = () => {
      const now = Date.now();
      if (now - lastSilentRefreshAtRef.current < 1500) return;
      lastSilentRefreshAtRef.current = now;
      loadProducts({ silent: true });
    };

    const handleWindowFocus = () => { triggerSilentRefresh(); };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') triggerSilentRefresh();
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') triggerSilentRefresh();
    }, 12000);

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [businessId, loadProducts]);

  useEffect(() => { localStorage.setItem('catalogStockMode', stockMode); }, [stockMode]);
  useEffect(() => { localStorage.setItem('catalogShowPrices', showPrices); }, [showPrices]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'catalogStockMode') {
        setStockMode(e.newValue || 'numeric');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const branchScopedProducts = useMemo(
    () => products.filter((product) => isProductVisibleInBranch(product, normalizedSelectedBranch)),
    [products, normalizedSelectedBranch]
  );

  const categories = useMemo(() => {
    const cats = new Map();
    branchScopedProducts.forEach(p => {
      const id = p.categoryId || p.category_id || 'general';
      const name = p.categoryName || 'General';
      if (!cats.has(id)) cats.set(id, { id, name, count: 0, icon: p.categoryIcon, color: p.categoryColor });
      cats.get(id).count++;
    });
    return Array.from(cats.values()).sort((a, b) => b.count - a.count);
  }, [branchScopedProducts]);

  const filtered = useMemo(() => {
    let list = branchScopedProducts;
    if (search) { const q = search.toLowerCase(); list = list.filter(p => p.name?.toLowerCase().includes(q)); }
    if (activeCategory !== 'all') list = list.filter(p => (p.categoryId || p.category_id || 'general') == activeCategory);
    return list;
  }, [branchScopedProducts, search, activeCategory]);

  const totalStock = useMemo(
    () => filtered.reduce((sum, product) => sum + getProductStockForBranch(product, normalizedSelectedBranch), 0),
    [filtered, normalizedSelectedBranch]
  );
  const totalValue = useMemo(
    () => filtered.reduce((sum, product) => sum + getProductStockForBranch(product, normalizedSelectedBranch) * Number(product.price || 0), 0),
    [filtered, normalizedSelectedBranch]
  );
  const totalCost = useMemo(
    () => filtered.reduce((sum, product) => sum + getProductStockForBranch(product, normalizedSelectedBranch) * Number(product.purchasePrice || 0), 0),
    [filtered, normalizedSelectedBranch]
  );

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.salePrice) return;
    setSaving(true);
    try {
      const b = getCurrentBusiness();
      const selectedBranchIds = (newProduct.branchIds || []).length > 0
        ? newProduct.branchIds
        : branchOptions.map((branch) => normalizeBranchId(branch.id));
      const res = await api.post('/products', {
        business_id: b.id, name: newProduct.name,
        sale_price: parseFloat(newProduct.salePrice) || 0,
        purchase_price: parseFloat(newProduct.purchasePrice) || 0,
        category_id: newProduct.categoryId || null,
        image_url: newProduct.imageUrl || null,
        unit: newProduct.unit || 'uds',
        branch_ids: selectedBranchIds.map(Number),
        inventories: selectedBranchIds.map((branchId) => ({
          branch_id: Number(branchId),
          current_stock: Number(newProduct.branchStocks?.[branchId]?.current_stock || 0),
          minimum_stock: Number(newProduct.branchStocks?.[branchId]?.minimum_stock || 0),
        })),
      });
      const added = normalizeProductFromApi(res.data);
      if (added) {
        setProducts((prev) => [added, ...prev.filter((product) => product.id !== added.id)]);
      }
      loadProducts({ silent: true });
      setShowAddModal(false);
      setAddModalTab('general');
      setNewProduct(buildNewProductState());
    } catch (e) { console.error(e) } finally { setSaving(false) }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      await api.patch(`/products/${editingProduct.id}`, {
        name: editingProduct.name,
        sale_price: parseFloat(editingProduct.salePrice) || 0,
        purchase_price: parseFloat(editingProduct.purchasePrice) || 0,
        category_id: editingProduct.categoryId || null,
        image_url: editingProduct.imageUrl || null,
      });
      await Promise.all(
        (editingProduct.inventoryEdits || []).map((inventory) =>
          api.patch(`/inventory/${inventory.id}`, {
            current_stock: Number(inventory.current_stock || 0),
            minimum_stock: Number(inventory.minimum_stock || 0),
          })
        )
      );

      loadProducts({ silent: true });
      setShowEditModal(false); setEditingProduct(null);
    } catch (e) { console.error(e) } finally { setSaving(false) }
  };

  const handleCreateCategory = async (target = 'new') => {
    if (!businessId || !newCategoryName.trim()) return;
    setCategorySaving(true);
    try {
      const response = await api.post('/categories', {
        business_id: businessId,
        parent_id: null,
        name: newCategoryName.trim(),
      });
      const category = response.data;
      setDbCategories((prev) => [...prev, category].sort((a, b) => String(a.name).localeCompare(String(b.name))));
      if (target === 'edit') {
        setEditingProduct((prev) => prev ? { ...prev, categoryId: String(category.id) } : prev);
      } else {
        setNewProduct((prev) => ({ ...prev, categoryId: String(category.id) }));
      }
      setNewCategoryName('');
    } catch (error) {
      console.error(error);
    } finally {
      setCategorySaving(false);
    }
  };

  const openEdit = (product) => {
    setEditingProduct({
      id: product.id, name: product.name,
      salePrice: product.price?.toString() || '0',
      purchasePrice: product.purchasePrice?.toString() || '0',
      categoryId: product.categoryId ? String(product.categoryId) : product.category_id ? String(product.category_id) : '',
      imageUrl: product.imageUrl || '',
      inventoryEdits: (product.variants || []).flatMap((variant) =>
        (variant.inventories || []).map((inventory) => ({
          id: inventory.id,
          variantId: variant.id,
          variantName: variant.name,
          branchId: inventory.branchId,
          branchName: inventory.branchName || `Sucursal ${inventory.branchId}`,
          current_stock: String(inventory.stock ?? 0),
          minimum_stock: String(inventory.minStock ?? 0),
        }))
      ),
    });
    setShowEditModal(true);
  };

  const totalProducts = branchScopedProducts.length;

  const ProductCard = ({ product }) => {
    const stock = getProductStockForBranch(product, normalizedSelectedBranch);
    const price = Number(product.price || 0);
    const purchasePrice = Number(product.purchasePrice || 0);
    const hasImage = product.imageUrl;
    const iconName = product.categoryIcon || null;
    const colorName = product.categoryColor || 'blue';
    const Icon = getIconComponent(iconName);
    const style = getCatStyle(colorName);
    const minimumStock = getProductMinStockForBranch(product, normalizedSelectedBranch) || 10;
    const isLowStock = stock > 0 && stock <= minimumStock;
    const isOutOfStock = stock === 0;

    return (
      <div
        onClick={() => openEdit(product)}
        className="group relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white dark:border-slate-700/80 dark:bg-slate-900 px-3 py-5 transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer text-center"
      >
        <button
          onClick={(e) => { e.stopPropagation(); openEdit(product); }}
          className="absolute right-2 top-2 z-20 flex h-5 w-5 items-center justify-center rounded-md text-slate-300 dark:text-slate-600 transition-colors hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Edit3 size={11} />
        </button>
        {!product.isActive && (
          <div className="absolute left-2 top-2 z-20 rounded px-1 py-0.5 text-[6px] font-bold uppercase tracking-wider text-red-500 bg-red-50 dark:bg-red-900/20">
            Inactivo
          </div>
        )}
        <div className="relative mb-2.5">
          <div
            className="absolute inset-0 -m-1.5 rounded-full"
            style={{ backgroundColor: toRgba(style.solid, 0.15) }}
          />
          <div className="relative flex items-center justify-center w-11 h-11">
            {hasImage ? (
              <img src={resolveAssetUrl(product.imageUrl)} alt={product.name} className="h-9 w-9 object-contain" />
            ) : (
              <Icon size={26} strokeWidth={1.3} color={style.solid} />
            )}
          </div>
        </div>
        <h3 className="text-[11px] font-semibold leading-snug text-slate-800 dark:text-slate-200 line-clamp-2 min-h-[1.8rem]">
          {product.name}
        </h3>
        <span className="mt-0.5 text-[8px] font-medium text-slate-400 dark:text-slate-500">
          {product.categoryName || 'General'}
        </span>
        <div className="mt-auto pt-2.5 w-full">
          <span className="text-[13px] font-bold text-slate-900 dark:text-white">
            ${price.toLocaleString()}
          </span>
          {showPrices && purchasePrice > 0 && (
            <span className="ml-1 text-[7px] text-slate-400 line-through">${purchasePrice.toLocaleString()}</span>
          )}
        </div>
        {stockMode === 'numeric' && (
          <div className="mt-1 flex items-center justify-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className="text-[8px] text-slate-400 dark:text-slate-500">
              {isOutOfStock ? 'Sin stock' : `${stock} uds`}
            </span>
          </div>
        )}
        {product.variants?.length > 1 && (
          <span className="mt-0.5 text-[7px] font-medium" style={{ color: style.solid }}>
            {product.variants.length} variantes
          </span>
        )}
      </div>
    );
  };

  if (!businessId) {
    return <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">Seleccioná un negocio para ver el catálogo</div>;
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 pt-4 pb-2 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Catálogo</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{totalProducts} producto{totalProducts !== 1 ? 's' : ''} · {categories.length} categoría{categories.length !== 1 ? 's' : ''} · {normalizedSelectedBranch === 'all' ? 'Vista global' : `Sucursal ${currentBranchName}`}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {isRefreshing ? 'Sincronizando productos...' : lastSyncAt ? `Actualizado ${lastSyncAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Esperando primera sincronización'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => loadProducts({ silent: true })}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title="Actualizar productos"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          {/* Price visibility toggle */}
          <button onClick={() => setShowPrices(v => !v)} className={`p-2 rounded-lg border transition-all ${showPrices ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500'}`} title={showPrices ? 'Ocultar precios de costo' : 'Mostrar precios de costo'}>
            <DollarSign size={14} className={showPrices ? '' : 'opacity-40'} />
          </button>
          {/* Stock mode toggle */}
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
            <button onClick={() => setStockMode('simple')} className={`px-2.5 py-1.5 text-[10px] font-bold transition-all flex items-center gap-1 ${stockMode === 'simple' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <Eye size={12} />Simple
            </button>
            <div className="w-px bg-slate-200 dark:bg-slate-700" />
            <button onClick={() => setStockMode('numeric')} className={`px-2.5 py-1.5 text-[10px] font-bold transition-all flex items-center gap-1 ${stockMode === 'numeric' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <Hash size={12} />Numérico
            </button>
          </div>
          {/* View mode toggle */}
          <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">{viewMode === 'grid' ? <List size={14} /> : <Grid3X3 size={14} />}</button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"><Plus size={14} /> Agregar</button>
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"><FileText size={14} /> Importar</button>
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-2 shrink-0">
        <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold ${normalizedSelectedBranch === 'all' ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'}`}>
          <Package size={13} />
          {normalizedSelectedBranch === 'all'
            ? 'Mostrando catálogo global con stock consolidado'
            : `Mostrando catálogo de ${currentBranchName} con stock local`}
        </div>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 lg:px-6 mb-2 shrink-0">
        <div className="app-card p-3 flex items-center gap-3">
          <div className="app-icon-box bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><Package size={16} /></div>
          <div>
            <p className="text-[18px] font-black text-slate-900 dark:text-white leading-none">{totalProducts}</p>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Productos</p>
          </div>
        </div>
        <div className="app-card p-3 flex items-center gap-3">
          <div className="app-icon-box bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"><ShoppingBag size={16} /></div>
          <div>
            <p className="text-[18px] font-black text-slate-900 dark:text-white leading-none">{totalStock}</p>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Stock total</p>
          </div>
        </div>
        <div className="app-card p-3 flex items-center gap-3">
          <div className="app-icon-box bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"><TrendingUp size={16} /></div>
          <div>
            <p className="text-[18px] font-black text-slate-900 dark:text-white leading-none">${totalValue.toLocaleString()}</p>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Valor venta</p>
          </div>
        </div>
        <div className="app-card p-3 flex items-center gap-3">
          <div className="app-icon-box bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"><TrendingDown size={16} /></div>
          <div>
            <p className="text-[18px] font-black text-slate-900 dark:text-white leading-none">${totalCost.toLocaleString()}</p>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Valor costo</p>
          </div>
        </div>
      </div>

      {products.length === 0 && !loading && !error && (
        <div className="mx-4 lg:mx-6 mb-2 px-4 py-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center shrink-0">
            <Package size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-amber-800 dark:text-amber-300 leading-tight">Cargá tus primeros productos</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400/80">Agregá productos a tu catálogo para empezar a vender</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="shrink-0 text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
            + Agregar
          </button>
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-1.5 px-4 lg:px-6 py-2 overflow-x-auto custom-scrollbar shrink-0">
        <button onClick={() => setActiveCategory('all')} className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${activeCategory === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <GalleryThumbnails size={12} />Todos
        </button>
        {categories.map(cat => {
          const CatIcon = cat.icon ? getIconComponent(cat.icon) : Tag;
          const isActive = activeCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}>
              <CatIcon size={12} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search bar + stats */}
      <div className="flex items-center gap-2 px-4 lg:px-6 py-2 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all" />
        </div>
        {stockMode === 'numeric' && (
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><ShoppingBag size={12} />{totalStock} uds</span>
            <span className="flex items-center gap-1"><TrendingUp size={12} />${totalValue.toLocaleString()}</span>
            <span className="flex items-center gap-1"><TrendingDown size={12} />${totalCost.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 pt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-60 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-slate-400 dark:text-slate-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Cargando productos...</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Obteniendo tu catálogo</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-60 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No se pudieron cargar los productos</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{error}</p>
            </div>
            <button onClick={loadProducts} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm">
              <RefreshCw size={14} /> Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-slate-400 dark:text-slate-500 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Package size={32} strokeWidth={1} className="text-slate-300 dark:text-slate-600" />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm text-slate-500 dark:text-slate-400">No hay productos</p>
              <p className="text-xs mt-1">{search ? 'Probá con otro término de búsqueda' : activeCategory !== 'all' ? 'No hay productos en esta categoría' : 'Agregá tu primer producto al catálogo'}</p>
            </div>
            {!search && activeCategory === 'all' && (
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"><Plus size={14} /> Agregar producto</button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2.5">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((p) => {
              const stock = getTotalStock(p);
              const branchStock = getProductStockForBranch(p, normalizedSelectedBranch);
              const cost = Number(p.purchasePrice || 0);
              const style = getCatStyle(p.categoryColor || 'blue');
              const Icon = getIconComponent(p.categoryIcon);
              const minimumStock = getProductMinStockForBranch(p, normalizedSelectedBranch) || 10;
              const isLowStock = branchStock > 0 && branchStock <= minimumStock;
              const isOutOfStock = branchStock === 0;
              return (
                <div
                  key={p.id}
                  onClick={() => openEdit(p)}
                  className="group relative overflow-hidden rounded-[22px] border bg-white dark:bg-slate-900 px-3.5 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                  style={{
                    borderColor: toRgba(style.solid, 0.16),
                    boxShadow: `0 18px 36px -30px ${toRgba(style.solid, 0.35)}`,
                  }}
                >
                  <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: toRgba(style.solid, 0.92) }} />
                  <div className="flex items-center gap-3 pl-2">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 rounded-2xl blur-xl opacity-40" style={{ backgroundColor: toRgba(style.solid, 0.20) }} />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-950 ring-4 shadow-sm" style={{ ['--tw-ring-color']: toRgba(style.solid, 0.12) }}>
                        {p.imageUrl ? (
                          <img src={resolveAssetUrl(p.imageUrl)} alt={p.name} className="h-full w-full object-contain p-2.5" />
                        ) : (
                          <Icon size={22} strokeWidth={1.9} color={style.solid} />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: toRgba(style.solid, 0.12), color: style.solid }}>
                          <Icon size={10} strokeWidth={2} />
                          {p.categoryName || 'General'}
                        </span>
                        {p.variants?.length > 1 && (
                          <span className="text-[10px] font-semibold" style={{ color: style.solid }}>
                            {p.variants.length} vars
                          </span>
                        )}
                      </div>
                      <h4 className="mt-1 text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate">{p.name}</h4>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[18px] font-black tracking-tight text-slate-900 dark:text-white">${Number(p.price || 0).toLocaleString()}</span>
                        {showPrices && cost > 0 && <span className="text-[10px] text-slate-400 line-through">${cost.toLocaleString()}</span>}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      <div className={`flex items-center gap-1.5 ${isOutOfStock ? 'text-red-600 dark:text-red-300' : isLowStock ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
                        <Package size={13} />
                        <span className="text-[11px] font-semibold whitespace-nowrap">
                          {isOutOfStock ? 'Sin stock' : `${branchStock} disp.`}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-200 hover:scale-105"
                        style={{ backgroundColor: style.solid }}
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Nuevo producto</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500"><X size={16} /></button>
            </div>
            <div className="mb-4 inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-1">
              <button
                type="button"
                onClick={() => setAddModalTab('general')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${addModalTab === 'general' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                General
              </button>
              <button
                type="button"
                onClick={() => setAddModalTab('stock')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${addModalTab === 'stock' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                Stock
              </button>
            </div>
            <div className="space-y-3">
              {addModalTab === 'general' ? (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Nombre</label>
                    <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="Ej. Coca Cola 500ml" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Precio venta</label>
                      <input type="number" value={newProduct.salePrice} onChange={e => setNewProduct(p => ({ ...p, salePrice: e.target.value }))} placeholder="0.00" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/15" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Precio compra</label>
                      <input type="number" value={newProduct.purchasePrice} onChange={e => setNewProduct(p => ({ ...p, purchasePrice: e.target.value }))} placeholder="0.00" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/15" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Tipo de venta</label>
                    <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      {[
                        { id: 'uds', label: 'Por unidad' },
                        { id: 'g', label: 'Por gramo' },
                        { id: '100g', label: 'Por 100g' },
                        { id: 'kg', label: 'Por kg' },
                      ].map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setNewProduct(p => ({ ...p, unit: u.id }))}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            newProduct.unit === u.id
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Categoría</label>
                    <select value={newProduct.categoryId} onChange={e => setNewProduct(p => ({ ...p, categoryId: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/15">
                      <option value="">Seleccionar</option>
                      {dbCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2 mt-2">
                      <input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nueva categoría"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15"
                      />
                      <button
                        type="button"
                        onClick={() => handleCreateCategory('new')}
                        disabled={categorySaving || !newCategoryName.trim()}
                        className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold disabled:opacity-50"
                      >
                        {categorySaving ? 'Creando...' : 'Crear'}
                      </button>
                    </div>
                  </div>
                  <ProductImagePicker name={newProduct.name} value={newProduct.imageUrl} onChange={(imageUrl) => setNewProduct((previous) => ({ ...previous, imageUrl }))} />
                </>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-3">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Sucursales donde se agregará</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Selecciona en qué locales existirá el producto y define su stock inicial.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewProduct((prev) => ({ ...prev, branchIds: branchOptions.map((branch) => normalizeBranchId(branch.id)) }))}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-300"
                      >
                        Agregar en todas
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {branchOptions.map((branch) => {
                        const branchId = normalizeBranchId(branch.id);
                        const selected = (newProduct.branchIds || []).includes(branchId);
                        return (
                          <button
                            key={branchId}
                            type="button"
                            onClick={() => setNewProduct((prev) => {
                              const exists = (prev.branchIds || []).includes(branchId);
                              const nextBranchIds = exists
                                ? prev.branchIds.filter((id) => id !== branchId)
                                : [...(prev.branchIds || []), branchId];
                              return { ...prev, branchIds: nextBranchIds };
                            })}
                            className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-all ${selected ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300'}`}
                          >
                            <span className="text-[11px] font-bold">{branch.name}</span>
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${selected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                              {selected ? 'OK' : '+'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(newProduct.branchIds || []).length === 0 ? (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Selecciona al menos una sucursal para cargar stock inicial.</p>
                    ) : (
                      (newProduct.branchIds || []).map((branchId) => {
                        const branch = branchOptions.find((item) => normalizeBranchId(item.id) === branchId);
                        return (
                          <div key={branchId} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{branch?.name || `Sucursal ${branchId}`}</p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">Stock local</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Stock inicial</label>
                                <input
                                  type="number"
                                  value={newProduct.branchStocks?.[branchId]?.current_stock || ''}
                                  onChange={(e) => setNewProduct((prev) => ({
                                    ...prev,
                                    branchStocks: {
                                      ...prev.branchStocks,
                                      [branchId]: {
                                        ...(prev.branchStocks?.[branchId] || {}),
                                        current_stock: e.target.value,
                                      },
                                    },
                                  }))}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Stock mínimo</label>
                                <input
                                  type="number"
                                  value={newProduct.branchStocks?.[branchId]?.minimum_stock || ''}
                                  onChange={(e) => setNewProduct((prev) => ({
                                    ...prev,
                                    branchStocks: {
                                      ...prev.branchStocks,
                                      [branchId]: {
                                        ...(prev.branchStocks?.[branchId] || {}),
                                        minimum_stock: e.target.value,
                                      },
                                    },
                                  }))}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
              <button onClick={handleAddProduct} disabled={saving || !newProduct.name || !newProduct.salePrice} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}{saving ? 'Guardando...' : 'Agregar producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && businessId && (
        <ImportFromPhoto
          businessId={businessId}
          dbCategories={dbCategories}
          onClose={() => { setShowImportModal(false); loadProducts(); }}
        />
      )}

      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Editar producto</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {editingProduct.imageUrl && (
                <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img src={resolveAssetUrl(editingProduct.imageUrl)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm flex items-center gap-1"><Camera size={11} /> Vista previa</div>
                </div>
              )}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Nombre</label>
                <input value={editingProduct.name} onChange={e => setEditingProduct(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Precio venta</label>
                  <div className="relative"><DollarSign size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="number" value={editingProduct.salePrice} onChange={e => setEditingProduct(p => ({ ...p, salePrice: e.target.value }))} className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none" /></div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Precio compra</label>
                  <div className="relative"><DollarSign size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="number" value={editingProduct.purchasePrice} onChange={e => setEditingProduct(p => ({ ...p, purchasePrice: e.target.value }))} className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none" /></div>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Categoría</label>
                <select value={editingProduct.categoryId} onChange={e => setEditingProduct(p => ({ ...p, categoryId: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none">
                  <option value="">Sin categoría</option>
                  {dbCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="flex gap-2 mt-2">
                  <input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nueva categoría"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCreateCategory('edit')}
                    disabled={categorySaving || !newCategoryName.trim()}
                    className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold disabled:opacity-50"
                  >
                    {categorySaving ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </div>
              <div className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Stock e inventario</label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Edita por sucursal</span>
                </div>
                {(editingProduct.inventoryEdits || []).length === 0 ? (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Este producto no tiene inventarios creados todavía.</p>
                ) : (
                  <div className="space-y-2">
                    {editingProduct.inventoryEdits.map((inventory, index) => (
                      <div key={inventory.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div>
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{inventory.branchName}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{inventory.variantName}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Stock actual</label>
                            <input
                              type="number"
                              value={inventory.current_stock}
                              onChange={(e) => setEditingProduct((prev) => ({
                                ...prev,
                                inventoryEdits: prev.inventoryEdits.map((item, itemIndex) => itemIndex === index ? { ...item, current_stock: e.target.value } : item),
                              }))}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Stock mínimo</label>
                            <input
                              type="number"
                              value={inventory.minimum_stock}
                              onChange={(e) => setEditingProduct((prev) => ({
                                ...prev,
                                inventoryEdits: prev.inventoryEdits.map((item, itemIndex) => itemIndex === index ? { ...item, minimum_stock: e.target.value } : item),
                              }))}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <ProductImagePicker name={editingProduct.name} value={editingProduct.imageUrl} onChange={(imageUrl) => setEditingProduct((previous) => ({ ...previous, imageUrl }))} />
              <button onClick={handleEditProduct} disabled={saving} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
