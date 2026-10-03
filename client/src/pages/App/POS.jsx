import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  BookOpen, 
  X,
  Check,
  LayoutGrid,
  List,
  Store,
  ChevronDown,
  Archive,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Receipt,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  CheckCircle,
  Printer,
  Download,
  Save,
  Tag,
  Wine,
  Beer,
  Coffee,
  Milk,
  Droplets,
  Sparkles,
  SprayCan,
  Scissors,
  Heart,
  Pill,
  Cookie,
  Candy,
  Apple,
  Beef,
  Snowflake,
  Home,
  Shirt,
  ShoppingBag as ShoppingBagIcon,
  Dog,
  Flower2,
  Hammer,
  Car,
  Smartphone,
  WashingMachine,
  Croissant,
  Cake,
  Baby
} from 'lucide-react';
import { getCategoryById, productCategories } from '../Admin/config/productCategories';
import { getCurrentBusiness, getCurrentUser, getCashRegisterStatus } from '../../services/api';
import { useNotification } from '../../shared/components/Notification/NotificationContext';
import api from '../../services/api';
import { normalizeProductFromApi } from '../../shared/utils/productNormalization';

const ICON_MAP = { Wine, Beer, Coffee, Milk, Droplets, Sparkles, SprayCan, Scissors, Heart, Pill, Cookie, Candy, Apple, Beef, Snowflake, Home, Shirt, ShoppingBag: ShoppingBagIcon, Dog, Flower2, Hammer, Car, Smartphone, WashingMachine, Package, Tag, Croissant, Cake, Baby };

const getIconComponent = (iconName) => {
  if (!iconName) return Tag;
  return ICON_MAP[iconName] || Tag;
};



const POS = () => {
  const { selectedBranch, branches = [] } = useOutletContext();
  const notify = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [selectedWeightProduct, setSelectedWeightProduct] = useState(null);
  const [customWeight, setCustomWeight] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const [posBranch, setPosBranch] = useState('all');
  const [isPosBranchDropdownOpen, setIsPosBranchDropdownOpen] = useState(false);
  const posBranchRef = useRef(null);

  const [isCajaDropdownOpen, setIsCajaDropdownOpen] = useState(false);
  const cajaRef = useRef(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (posBranchRef.current && !posBranchRef.current.contains(event.target)) {
        setIsPosBranchDropdownOpen(false);
      }
      if (cajaRef.current && !cajaRef.current.contains(event.target)) {
        setIsCajaDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Caja state
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [cajaOpenTime, setCajaOpenTime] = useState(null);
  const [cajaSales, setCajaSales] = useState([]);
  const [cajaExpenses, setCajaExpenses] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCerrarCajaModalOpen, setIsCerrarCajaModalOpen] = useState(false);
  const [closeCountedCash, setCloseCountedCash] = useState('');
  const [closeCountedMp, setCloseCountedMp] = useState('');
  const [closeCountedTransfer, setCloseCountedTransfer] = useState('');
  const [expenseConcept, setExpenseConcept] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseType, setExpenseType] = useState('gasto'); // gasto | perdida
  const [isCajaHistoryOpen, setIsCajaHistoryOpen] = useState(false);

  const cajaTotalVentas = cajaSales.reduce((s, v) => s + v.total, 0);
  const cajaTotalGastos = cajaExpenses.reduce((s, g) => s + g.amount, 0);
  const cajaBalance = cajaTotalVentas - cajaTotalGastos;

  const cajaByMethod = useMemo(() => {
    const acc = { cash: 0, mp: 0, transfer: 0, fiado: 0 };
    cajaSales.forEach(s => { if (acc[s.method] !== undefined) acc[s.method] += s.total; });
    return acc;
  }, [cajaSales]);

  const closeValidation = useMemo(() => {
    const countedCash = Number(closeCountedCash) || 0;
    const countedMp = Number(closeCountedMp) || 0;
    const countedTransfer = Number(closeCountedTransfer) || 0;
    const total = countedCash + countedMp + countedTransfer;
    return {
      countedCash, countedMp, countedTransfer, total,
      diffCash: countedCash - cajaByMethod.cash,
      diffMp: countedMp - cajaByMethod.mp,
      diffTransfer: countedTransfer - cajaByMethod.transfer,
      totalDiff: total - (cajaByMethod.cash + cajaByMethod.mp + cajaByMethod.transfer),
      isReady: closeCountedCash !== '' && closeCountedMp !== '' && closeCountedTransfer !== '',
    };
  }, [closeCountedCash, closeCountedMp, closeCountedTransfer, cajaByMethod]);

  // Check cash register status on mount and when branch changes
  useEffect(() => {
    const business = getCurrentBusiness();
    if (!business) return;
    const branchId = posBranch !== 'all' ? posBranch : null;
    getCashRegisterStatus({ businessId: business.id, branchId }).then(status => {
      if (status) {
        setCajaAbierta(true);
        setCajaOpenTime(new Date(status.opened_at));
      } else {
        setCajaAbierta(false);
        setCajaOpenTime(null);
      }
    }).catch(() => {});
  }, [posBranch]);

  const formatCajaTime = () => {
    if (!cajaOpenTime) return '0h 0m';
    const diff = Date.now() - (cajaOpenTime instanceof Date ? cajaOpenTime.getTime() : new Date(cajaOpenTime).getTime());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const registerExpense = async () => {
    if (!expenseConcept.trim() || !expenseAmount || expenseAmount <= 0) return;
    const business = getCurrentBusiness();
    if (!business) { notify.error('No hay negocio seleccionado'); return; }
    const branchId = ensureBranchSelected();
    if (!branchId) return;
    try {
      await api.post('/cashMovements', {
        business_id: business.id,
        branch_id: branchId,
        type: 'expense',
        category: expenseType === 'perdida' ? 'loss' : 'expense',
        description: expenseConcept,
        amount: Number(expenseAmount),
        created_by_user_id: getCurrentUser()?.id || null,
      });
      setCajaExpenses(prev => [...prev, { id: Date.now(), time: new Date(), concept: expenseConcept, amount: Number(expenseAmount), type: expenseType }]);
      setExpenseConcept('');
      setExpenseAmount('');
      setIsExpenseModalOpen(false);
      notify.success(expenseType === 'perdida' ? 'Pérdida registrada' : 'Gasto registrado');
    } catch (err) {
      notify.error('Error al registrar: ' + (err.response?.data?.message || err.message));
    }
  };

  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  const [cashPaid, setCashPaid] = useState(0);
  const [shouldInvoice, setShouldInvoice] = useState(false);
  const [invoiceReceiptType, setInvoiceReceiptType] = useState('B');
  const [invoiceCustomerName, setInvoiceCustomerName] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  const arcaConfig = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('gestly_arca_config');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  }, []);
  
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const availableBranches = useMemo(
    () => branches.map((branch) => ({ ...branch, id: String(branch.id) })),
    [branches]
  );

  useEffect(() => {
    if (availableBranches.length === 0) {
      setPosBranch('all');
      return;
    }

    if (
      selectedBranch &&
      selectedBranch !== 'all' &&
      availableBranches.some((branch) => branch.id === String(selectedBranch))
    ) {
      setPosBranch(String(selectedBranch));
      return;
    }

    if (!availableBranches.some((branch) => branch.id === String(posBranch))) {
      setPosBranch(availableBranches[0].id);
    }
  }, [availableBranches, posBranch, selectedBranch]);

  useEffect(() => {
    const business = getCurrentBusiness();
    if (!business) { setProductsLoading(false); return; }
    api.get(`/businesses/${business.id}/products`).then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setProducts(data.map(normalizeProductFromApi).filter(Boolean));
    }).catch((err) => {
      notify.error('Error al cargar productos: ' + (err.response?.data?.message || err.message));
    }).finally(() => setProductsLoading(false));
    
    api.get('/customers', { params: { businessId: business.id } }).then(res => {
      setCustomers(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (customerRef.current && !customerRef.current.contains(e.target)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [maxPrice, setMaxPrice] = useState('all');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || String(p.categoryId) === String(selectedCategory);
    let matchesPrice = true;
    if (maxPrice !== 'all') {
      matchesPrice = p.price <= parseInt(maxPrice);
    }
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const categoryMap = useMemo(() => {
    const map = {};
    products.forEach(p => { if (p.categoryId) map[p.categoryId] = p.categoryName; });
    return map;
  }, [products]);
  const categories = ['all', ...Object.keys(categoryMap)];
  const currentPosBranch = availableBranches.find((branch) => branch.id === String(posBranch)) || null;

  const ensureBranchSelected = () => {
    if (!currentPosBranch) {
      notify.error('Seleccioná una sucursal válida para operar en el POS.');
      return null;
    }
    return currentPosBranch.id;
  };

   const addToCart = (product, weight = null) => {
    const isWeightProduct = product.unit === '100g' || product.unit === 'kg' || product.unit === 'g';
    if (isWeightProduct && !weight) {
      setSelectedWeightProduct(product);
      setCustomWeight('');
      setIsWeightModalOpen(true);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: weight ? item.quantity + weight : item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: weight || 1 }];
    });

    setIsWeightModalOpen(false);
  };

  const handleCustomWeightSubmit = () => {
    if (!selectedWeightProduct || !customWeight || isNaN(customWeight) || customWeight <= 0) return;
    let weightInBase;
    if (selectedWeightProduct.unit === 'kg') {
      weightInBase = Number(customWeight);
    } else if (selectedWeightProduct.unit === 'g') {
      weightInBase = Number(customWeight) / 1000;
    } else {
      weightInBase = Number(customWeight) / 100;
    }
    addToCart(selectedWeightProduct, weightInBase);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
      setCart([]);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const confirmPayment = async () => {
    if (paymentMethod === 'fiado' && !customerName.trim()) {
      notify.warning('Debe ingresar o seleccionar un cliente para fiar.');
      return;
    }
    const business = getCurrentBusiness();
    if (!business) { notify.error('No hay negocio seleccionado'); return; }
    const branchId = ensureBranchSelected();
    if (!branchId) return;
    
    let customerId = selectedCustomerId;
    
    // Create new customer if needed
    if (isNewCustomer && customerName.trim()) {
      try {
        const newCust = await api.post('/customers', {
          business_id: business.id,
          name: customerName.trim(),
          phone: null,
        });
        customerId = newCust.data.id;
        setCustomers(prev => [...prev, newCust.data]);
      } catch (e) {
        console.error('Error creating customer:', e);
      }
    }
    
    try {
      const saleBody = {
        business_id: business.id,
        branch_id: branchId,
        customer_id: customerId || null,
        seller_id: getCurrentUser()?.id || null,
        payment_method: paymentMethod,
        subtotal: cartTotal,
        discount: discountAmount,
        total: finalTotal,
        status: paymentMethod === 'fiado' ? 'pending' : 'paid',
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
        })),
      };
      await api.post('/salesTransactions', saleBody);
      setProducts(prev => prev.map(p => {
        const cartItem = cart.find(c => c.id === p.id);
        if (!cartItem) return p;
        return { ...p, stock: Math.max(0, (p.stock || 0) - cartItem.quantity) };
      }));
      if (paymentMethod === 'fiado' && customerId) {
        try {
          await api.post('/customerDebts', {
            business_id: business.id,
            customer_id: customerId,
            branch_id: branchId,
            amount: finalTotal,
            notes: `Venta fiada - ${cart.length} items`,
          });
        } catch (e) { console.error('Error creando deuda:', e); }
      }
      setCajaSales(prev => [...prev, { id: Date.now(), time: new Date(), items: cart.length, total: finalTotal, method: paymentMethod }]);
      setIsPaymentModalOpen(false);
      notify.success('Venta registrada correctamente');
      
      if (shouldInvoice && arcaConfig?.cuit) {
        const invoice = {
          number: `000${arcaConfig.pointOfSale || 1}-${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
          receiptType: invoiceReceiptType,
          date: new Date().toLocaleDateString('es-AR'),
          businessName: arcaConfig.businessName || 'Mi Comercio',
          cuit: arcaConfig.cuit,
          ivaCondition: arcaConfig.ivaCondition,
          address: arcaConfig.address || '',
          customerName: invoiceCustomerName || 'Consumidor Final',
          customerCuit: 'DNI en trámite',
          items: [...cart],
          subtotal: cartTotal,
          discount: discountAmount,
          total: finalTotal,
          paymentMethod: paymentMethod,
        };
        setLastInvoice(invoice);
        setIsInvoiceModalOpen(true);
      } else {
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          setCart([]);
          setIsSuccessModalOpen(false);
          setPaymentMethod('cash');
          setCustomerName('');
          setDiscountAmount(0);
          setDiscountReason('');
          setCashPaid(0);
          setShouldInvoice(false);
          setInvoiceCustomerName('');
        }, 2500);
      }
    } catch (err) {
      notify.error('Error al registrar venta: ' + (err.response?.data?.message || err.message));
    }
  };

  const finalTotal = cartTotal + Number(discountAmount);
  const isDiscount = discountAmount < 0;
  
  const bills = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

  const formatQty = (item) => {
    if (item.unit === '100g') {
      const grams = item.quantity * 100;
      if (grams >= 1000) return `${(grams / 1000).toFixed(2).replace(/\.00$/, '')}kg`;
      return `${Math.round(grams)}g`;
    }
    if (item.unit === 'kg') {
      return item.quantity >= 1 ? `${item.quantity.toFixed(2).replace(/\.00$/, '')}kg` : `${(item.quantity * 1000).toFixed(0)}g`;
    }
    if (item.unit === 'g') {
      return item.quantity >= 1 ? `${item.quantity.toFixed(0)}g` : `${item.quantity.toFixed(2)}kg`;
    }
    return item.quantity;
  };

  const getStockColor = (stock) => {
    if (stock > 50) return 'bg-emerald-500';
    if (stock > 20) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStockLabel = (stock) => {
    if (stock > 50) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (stock > 20) return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  // Color mapper for category accent
  const getCatColor = (colorStr) => {
    if (!colorStr) return 'from-slate-500 to-slate-600';
    if (colorStr.includes('purple')) return 'from-purple-500 to-purple-600';
    if (colorStr.includes('blue')) return 'from-blue-500 to-blue-600';
    if (colorStr.includes('amber')) return 'from-amber-500 to-amber-600';
    if (colorStr.includes('pink')) return 'from-pink-500 to-pink-600';
    if (colorStr.includes('rose')) return 'from-rose-500 to-rose-600';
    if (colorStr.includes('cyan')) return 'from-cyan-500 to-cyan-600';
    if (colorStr.includes('red')) return 'from-red-500 to-red-600';
    if (colorStr.includes('yellow')) return 'from-yellow-500 to-yellow-600';
    if (colorStr.includes('orange')) return 'from-orange-500 to-orange-600';
    if (colorStr.includes('emerald')) return 'from-emerald-500 to-emerald-600';
    if (colorStr.includes('green')) return 'from-green-500 to-green-600';
    if (colorStr.includes('sky')) return 'from-sky-500 to-sky-600';
    if (colorStr.includes('indigo')) return 'from-indigo-500 to-indigo-600';
    if (colorStr.includes('violet')) return 'from-violet-500 to-violet-600';
    if (colorStr.includes('fuchsia')) return 'from-fuchsia-500 to-fuchsia-600';
    if (colorStr.includes('lime')) return 'from-lime-500 to-lime-600';
    if (colorStr.includes('teal')) return 'from-teal-500 to-teal-600';
    return 'from-slate-500 to-slate-600';
  };

  const getAccentBar = (colorStr) => {
    if (!colorStr) return 'bg-slate-500';
    if (colorStr.includes('purple')) return 'bg-purple-500';
    if (colorStr.includes('blue')) return 'bg-blue-500';
    if (colorStr.includes('amber')) return 'bg-amber-500';
    if (colorStr.includes('pink')) return 'bg-pink-500';
    if (colorStr.includes('rose')) return 'bg-rose-500';
    if (colorStr.includes('cyan')) return 'bg-cyan-500';
    if (colorStr.includes('red')) return 'bg-red-500';
    if (colorStr.includes('yellow')) return 'bg-yellow-500';
    if (colorStr.includes('orange')) return 'bg-orange-500';
    if (colorStr.includes('emerald')) return 'bg-emerald-500';
    if (colorStr.includes('green')) return 'bg-green-500';
    if (colorStr.includes('sky')) return 'bg-sky-500';
    if (colorStr.includes('indigo')) return 'bg-indigo-500';
    if (colorStr.includes('violet')) return 'bg-violet-500';
    if (colorStr.includes('fuchsia')) return 'bg-fuchsia-500';
    if (colorStr.includes('lime')) return 'bg-lime-500';
    if (colorStr.includes('teal')) return 'bg-teal-500';
    return 'bg-slate-500';
  };

  const getAccentGradient = (colorStr) => {
    if (!colorStr) return 'from-slate-400/20';
    if (colorStr.includes('purple')) return 'from-purple-400/20';
    if (colorStr.includes('blue')) return 'from-blue-400/20';
    if (colorStr.includes('amber')) return 'from-amber-400/20';
    if (colorStr.includes('pink')) return 'from-pink-400/20';
    if (colorStr.includes('rose')) return 'from-rose-400/20';
    if (colorStr.includes('cyan')) return 'from-cyan-400/20';
    if (colorStr.includes('red')) return 'from-red-400/20';
    if (colorStr.includes('yellow')) return 'from-yellow-400/20';
    if (colorStr.includes('orange')) return 'from-orange-400/20';
    if (colorStr.includes('emerald')) return 'from-emerald-400/20';
    if (colorStr.includes('green')) return 'from-green-400/20';
    if (colorStr.includes('sky')) return 'from-sky-400/20';
    if (colorStr.includes('indigo')) return 'from-indigo-400/20';
    if (colorStr.includes('violet')) return 'from-violet-400/20';
    if (colorStr.includes('fuchsia')) return 'from-fuchsia-400/20';
    if (colorStr.includes('lime')) return 'from-lime-400/20';
    if (colorStr.includes('teal')) return 'from-teal-400/20';
    return 'from-slate-400/20';
  };

  const getCategoryHex = (colorStr) => {
    if (!colorStr) return '#64748b';
    if (colorStr.includes('purple')) return '#8b5cf6';
    if (colorStr.includes('blue')) return '#3b82f6';
    if (colorStr.includes('amber')) return '#f59e0b';
    if (colorStr.includes('pink')) return '#ec4899';
    if (colorStr.includes('rose')) return '#f43f5e';
    if (colorStr.includes('cyan')) return '#06b6d4';
    if (colorStr.includes('red')) return '#ef4444';
    if (colorStr.includes('yellow')) return '#eab308';
    if (colorStr.includes('orange')) return '#f97316';
    if (colorStr.includes('emerald')) return '#10b981';
    if (colorStr.includes('green')) return '#22c55e';
    if (colorStr.includes('sky')) return '#0ea5e9';
    if (colorStr.includes('indigo')) return '#6366f1';
    if (colorStr.includes('violet')) return '#8b5cf6';
    if (colorStr.includes('fuchsia')) return '#d946ef';
    if (colorStr.includes('lime')) return '#84cc16';
    if (colorStr.includes('teal')) return '#14b8a6';
    return '#64748b';
  };

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

  const resolveCategoryMeta = (product) => {
    const configCategory = getCategoryById(product.categoryId);
    const resolvedIcon = configCategory?.icon || getIconComponent(product.categoryIcon);
    const resolvedName = configCategory?.name || product.categoryName || 'Categoría';
    const resolvedHex = configCategory?.color ? getCategoryHex(configCategory.color) : getCategoryHex(product.categoryColor || '');
    return {
      icon: resolvedIcon || Package,
      name: resolvedName,
      hex: resolvedHex,
    };
  };

  const categoryOptions = useMemo(() => {
    const counts = {};
    products.forEach(p => { if (p.categoryId) counts[p.categoryId] = (counts[p.categoryId] || 0) + 1; });
    return categories.map((catId) => {
      if (catId === 'all') {
        return { id: 'all', name: 'Todos', icon: LayoutGrid, hex: '#0f172a', count: products.length };
      }
      const cfg = getCategoryById(catId);
      const sample = products.find(p => String(p.categoryId) === String(catId));
      const hex = cfg?.color ? getCategoryHex(cfg.color) : getCategoryHex(sample?.categoryColor || '');
      const IconComp = cfg?.icon || (sample ? getIconComponent(sample.categoryIcon) : Tag);
      return {
        id: catId,
        name: cfg?.name || categoryMap[catId] || catId,
        icon: IconComp || Tag,
        hex,
        count: counts[catId] || 0,
      };
    });
  }, [categories, products, categoryMap]);

  return (
    <div className="h-full flex flex-col lg:flex-row bg-slate-50/50 dark:bg-slate-950 relative overflow-hidden">
      
      {/* Floating cart button (mobile) */}
      {!isCartOpen && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center"
        >
          <ShoppingCart size={24} />
          {cartItemsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg">
              {cartItemsCount}
            </span>
          )}
        </button>
      )}

      {/* Left Area: Products */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 lg:px-5 py-3 z-20">
          {/* Top row: Title + Branch/Caja */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-3">
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div>
                <h1 className="text-base font-display font-bold tracking-tight text-slate-900 dark:text-white">Punto de Venta</h1>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:block">{filteredProducts.length} productos disponibles</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative" ref={posBranchRef}>
                <button 
                  onClick={() => setIsPosBranchDropdownOpen(!isPosBranchDropdownOpen)}
                  className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg font-bold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Store size={14} className="text-indigo-500" />
                  <span className="hidden sm:inline">{currentPosBranch?.name || 'Seleccionar sucursal'}</span>
                  <span className="sm:hidden">{currentPosBranch?.name || 'Sucursal'}</span>
                  <ChevronDown size={12} className={`text-slate-400 transition-transform ${isPosBranchDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPosBranchDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                    {availableBranches.map((b) => (
                      <div key={b.id} 
                        className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors flex items-center justify-between ${posBranch === b.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        onClick={() => { setPosBranch(b.id); setIsPosBranchDropdownOpen(false); }}
                      >
                        {b.name}
                        {posBranch === b.id && <Check size={14} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={cajaRef}>
                <button 
                  onClick={() => setIsCajaDropdownOpen(!isCajaDropdownOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-bold text-[11px] transition-colors border ${
                    cajaAbierta
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Archive size={14} />
                  <span>{cajaAbierta ? 'Abierta' : 'Cerrada'}</span>
                  <span className="hidden sm:inline text-[9px] opacity-60 ml-0.5 font-medium">{formatCajaTime()}</span>
                  <ChevronDown size={12} className={`transition-transform ${isCajaDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCajaDropdownOpen && cajaAbierta && (
                  <div className="absolute top-full right-0 mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                    {/* Period info */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2">
                        <Clock size={12} />
                        <span>Abierta hace {formatCajaTime()}</span>
                        <span className="opacity-50">·</span>
                        <span>{cajaOpenTime ? (cajaOpenTime instanceof Date ? cajaOpenTime : new Date(cajaOpenTime)).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '--:--'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <p className="text-[18px] font-black text-slate-900 dark:text-white">{cajaSales.length}</p>
                          <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ventas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[18px] font-black text-emerald-600 dark:text-emerald-400">${cajaTotalVentas.toLocaleString()}</p>
                          <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ingresos</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-[18px] font-black ${cajaBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                            ${cajaBalance.toLocaleString()}
                          </p>
                          <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Balance</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick expense */}
                    <div className="px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800"
                      onClick={() => { setIsCajaDropdownOpen(false); setIsExpenseModalOpen(true); }}>
                      <ArrowDownCircle size={14} className="text-red-500" />
                      <span>Registrar Gasto / Pérdida</span>
                    </div>

                    {/* History toggle */}
                    <div className="px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800"
                      onClick={() => { setIsCajaHistoryOpen(!isCajaHistoryOpen); }}>
                      <Receipt size={14} className="text-indigo-500" />
                      <span>Movimientos ({cajaSales.length + cajaExpenses.length})</span>
                      <ChevronDown size={12} className={`ml-auto transition-transform ${isCajaHistoryOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isCajaHistoryOpen && (
                      <div className="max-h-40 overflow-y-auto custom-scrollbar border-b border-slate-100 dark:border-slate-800">
                        {[...cajaSales.map(v => ({...v, tipo: 'venta'})), ...cajaExpenses.map(g => ({...g, tipo: g.type}))]
                          .sort((a, b) => b.time - a.time)
                          .slice(0, 10)
                          .map(mov => (
                            <div key={mov.id} className="px-4 py-2 flex items-center gap-2.5 text-xs border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                              {mov.tipo === 'venta' ? (
                                <TrendingUp size={12} className="text-emerald-500 shrink-0" />
                              ) : (
                                <ArrowDownCircle size={12} className="text-red-500 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {mov.tipo === 'venta' ? `Venta #${mov.id}` : mov.concept}
                                </p>
                                <p className="text-[9px] text-slate-400">{mov.time.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>
                              </div>
                              <span className={`font-black ${mov.tipo === 'venta' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {mov.tipo === 'venta' ? '+' : '-'}${mov.total || mov.amount}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Close caja */}
                    <div className="px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition-colors flex items-center gap-2.5"
                      onClick={() => { setIsCajaDropdownOpen(false); setIsCerrarCajaModalOpen(true); }}>
                      <X size={14} /> Cerrar Caja
                    </div>
                  </div>
                )}
                {isCajaDropdownOpen && !cajaAbierta && (
                  <div className="absolute top-full right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                    <div className="p-3">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 text-center mb-2">Caja cerrada</p>
                      <button onClick={async () => {
                        const business = getCurrentBusiness();
                        const branchId = ensureBranchSelected();
                        if (!business || !branchId) return;
                        try {
                          const result = await api.post('/cash/open', { business_id: business.id, branch_id: branchId, initial_amount: 0 });
                          setCajaOpenTime(new Date(result.data.opened_at));
                        } catch (e) { console.error(e); return; }
                        setCajaAbierta(true); setIsCajaDropdownOpen(false); notify.success('Caja abierta');
                      }}
                      className="w-full py-2 rounded-lg font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                        Abrir caja
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search + Filters row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Buscar producto por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-colors dark:text-white"
              />
            </div>

            <button 
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-colors border ${
                isFiltersOpen || selectedCategory !== 'all' || maxPrice !== 'all'
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
              }`}
            >
              Filtros
              {(selectedCategory !== 'all' || maxPrice !== 'all') && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>

            <div className="hidden sm:flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shrink-0">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Vista Cuadrícula"
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Vista Lista"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Filters Panel — estilo rail como referencia */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isFiltersOpen ? 'max-h-[26rem] opacity-100 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800' : 'max-h-0 opacity-0'}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Categorías</h3>
                <span className="text-[10px] font-bold text-slate-400">{categoryOptions.length - 1} categorías</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 pt-0.5 px-0.5 custom-scrollbar snap-x">
                {categoryOptions.map((cat) => {
                  const isActive = String(selectedCategory) === String(cat.id);
                  const CatIcon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`snap-start shrink-0 w-[76px] flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-2.5 transition-all duration-200 active:scale-95 ${
                        isActive
                          ? 'bg-slate-900 border-slate-900 shadow-lg shadow-slate-900/20 dark:bg-white dark:border-white dark:shadow-white/10'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600'
                      }`}
                    >
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                        style={isActive
                          ? { backgroundColor: 'rgba(255,255,255,0.15)' }
                          : { backgroundColor: toRgba(cat.hex, 0.14) }
                        }
                      >
                        <CatIcon size={19} strokeWidth={2} color={isActive ? '#fff' : cat.hex} className={isActive && cat.id === 'all' ? 'dark:!text-slate-900' : ''} />
                      </span>
                      <span className={`text-[10px] font-bold leading-tight text-center line-clamp-2 min-h-[1.7rem] ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300'}`}>
                        {cat.name}
                      </span>
                      <span className={`text-[9px] font-semibold tabular-nums ${isActive ? 'text-white/60 dark:text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}>
                        {cat.id === 'all' ? `${cat.count}` : `${cat.count}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Precio máximo</h3>
              <div className="flex flex-wrap gap-1.5">
                {[{v:'all',l:'Sin límite'},{v:1000,l:'$1.000'},{v:2000,l:'$2.000'},{v:5000,l:'$5.000'},{v:10000,l:'$10.000'}].map(opt => (
                  <button
                    key={opt.v}
                    onClick={() => setMaxPrice(opt.v)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors border ${
                      maxPrice === opt.v 
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button 
                onClick={() => { setSelectedCategory('all'); setMaxPrice('all'); setSearchTerm(''); }}
                className="text-[11px] font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Products — encabezado estilo referencia + cards */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 lg:p-4 pb-20 lg:pb-4 bg-[#f8f9fb] dark:bg-slate-950">
          <div className="flex items-center justify-between mb-3 px-0.5">
            <p className="text-[13px] text-slate-900 dark:text-white">
              <span className="font-bold">Productos</span>{' '}
              <span className="font-medium text-slate-400 text-[11px]">{filteredProducts.length} productos</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] font-semibold text-slate-500 dark:text-slate-400">Más vendidos</span>
              <span className="sm:hidden text-[11px] font-bold text-slate-400">{cartItemsCount > 0 ? `${cartItemsCount} en carrito` : ''}</span>
            </div>
          </div>
          {productsLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-3">
              <Package size={40} strokeWidth={1} className="opacity-40 animate-pulse" />
              <p className="font-bold text-sm">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-3">
              <Package size={40} strokeWidth={1} className="opacity-40" />
              <p className="font-bold text-sm">No se encontraron productos</p>
              <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setMaxPrice('all'); }} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 underline">
                Limpiar búsqueda
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
              {filteredProducts.map(product => {
                const meta = resolveCategoryMeta(product);
                const Icon = meta.icon;
                const inCart = cart.find(c => c.id === product.id);
                const lowStock = (product.stock || 0) <= 0;
                const midStock = (product.stock || 0) <= 20;

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`group relative flex flex-col rounded-2xl border bg-white dark:bg-slate-900 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.18)] active:scale-[0.98] cursor-pointer text-left ${
                      inCart
                        ? 'border-slate-900 dark:border-white shadow-md'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)]'
                    }`}
                  >
                    {inCart && (
                      <div className="absolute left-2.5 top-2.5 z-10 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-900 dark:bg-white px-1.5 text-[10px] font-black text-white dark:text-slate-900 shadow">
                        {typeof inCart.quantity === 'number' && !Number.isInteger(inCart.quantity) ? inCart.quantity.toFixed(2) : inCart.quantity}
                      </div>
                    )}
                    {(product.unit === '100g' || product.unit === 'kg' || product.unit === 'g') && (
                      <span className="absolute right-2.5 top-2.5 z-10 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        Peso
                      </span>
                    )}
                    <div className="h-[76px] flex items-center justify-center mb-1.5 pt-1">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-[64px] w-[64px] object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <span
                          className="w-[58px] h-[58px] rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                          style={{ backgroundColor: toRgba(meta.hex, 0.12) }}
                        >
                          <Icon size={30} strokeWidth={1.6} color={meta.hex} />
                        </span>
                      )}
                    </div>
                    <h3 className="text-[12px] font-semibold leading-[1.25] text-slate-800 dark:text-slate-100 line-clamp-2 min-h-[2rem]">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-[13px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                      ${product.price.toLocaleString()}
                      {product.unit && (
                        <span className="ml-1 text-[10px] font-semibold text-slate-400">
                          /{product.unit === '100g' ? '100g' : product.unit}
                        </span>
                      )}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        <span className={`w-1.5 h-1.5 rounded-full ${lowStock ? 'bg-red-500' : midStock ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                        {product.stock} en stock
                      </span>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${inCart ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-white dark:group-hover:text-slate-900'}`}>
                        <Plus size={14} strokeWidth={2.6} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="flex flex-col gap-1.5">
              {filteredProducts.map(product => {
                const meta = resolveCategoryMeta(product);
                const Icon = meta.icon;
                const inCart = cart.find(c => c.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group relative overflow-hidden rounded-[22px] border bg-white dark:bg-slate-900 px-3.5 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] cursor-pointer"
                    style={{
                      borderColor: toRgba(meta.hex, 0.16),
                      boxShadow: `0 18px 36px -30px ${toRgba(meta.hex, 0.35)}`,
                    }}
                  >
                    <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: toRgba(meta.hex, 0.92) }} />
                    <div className="flex items-center gap-3 pl-2">
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 rounded-2xl blur-xl opacity-40" style={{ backgroundColor: toRgba(meta.hex, 0.20) }} />
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-950 ring-4 shadow-sm" style={{ ['--tw-ring-color']: toRgba(meta.hex, 0.12) }}>
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-contain p-2.5" />
                          ) : (
                            <Icon size={22} strokeWidth={1.9} color={meta.hex} />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: toRgba(meta.hex, 0.12), color: meta.hex }}>
                            <Icon size={10} strokeWidth={2} />
                            {meta.name}
                          </span>
                          {product.unit && (
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">/{product.unit}</span>
                          )}
                        </div>
                        <h4 className="mt-1 text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate">
                          {product.name}
                        </h4>
                        <div className="mt-1 text-[18px] font-black tracking-tight text-slate-900 dark:text-white">
                          ${product.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 ${product.stock <= 0 ? 'text-red-600 dark:text-red-300' : product.stock <= 20 ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
                          <Package size={13} />
                          <span className="text-[11px] font-semibold whitespace-nowrap">
                            {product.stock} disp.
                          </span>
                        </div>
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
                          style={{ backgroundColor: meta.hex }}
                        >
                          {inCart ? <span className="text-[11px] font-black">{inCart.quantity}</span> : <Plus size={14} strokeWidth={2.5} />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Cart */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[22rem] lg:static lg:z-10 lg:w-[22rem] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl lg:shadow-[-2px_0_16px_rgba(0,0,0,0.03)] transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        
        {/* Cart Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <ShoppingCart size={18} className="text-slate-600 dark:text-slate-300" />
              </div>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Carrito</h2>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{cart.length} {cart.length === 1 ? 'producto' : 'productos'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button onClick={clearCart} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Vaciar carrito">
                <Trash2 size={15} />
              </button>
            )}
            <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3" style={{ backgroundColor: 'var(--input-bg)' }}>
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3" style={{ color: 'var(--text-secondary)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--sidebar-hover)' }}>
                <ShoppingCart size={28} strokeWidth={1.2} className="opacity-40" />
              </div>
              <div className="text-center">
                <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>Carrito vacío</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Tocá un producto para agregarlo</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => {
                const meta = resolveCategoryMeta(item);
                const CartIcon = meta.icon;
                return (
                  <div key={item.id} className="rounded-xl border p-2.5 flex items-center gap-2.5 transition-all" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center relative" style={{ backgroundColor: `${meta.hex}15` }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <CartIcon size={18} color={meta.hex} strokeWidth={1.5} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</h4>
                      <p className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                        ${item.price.toLocaleString()} {item.unit && <span className="opacity-60">/ {item.unit === '100g' ? '100g' : item.unit}</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-l-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
                          <Minus size={10} strokeWidth={2.5} />
                        </button>
                        <span className="w-9 text-center font-black text-[11px] tabular-nums" style={{ color: 'var(--text-primary)' }} title={formatQty(item)}>
                          {formatQty(item)}
                        </span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-r-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
                          <Plus size={10} strokeWidth={2.5} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between items-center text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>
              <span>Subtotal ({cartItemsCount} ítems)</span>
              <span>${cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-black pt-2 border-t" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
              <span>Total</span>
              <span>${cartTotal.toLocaleString()}</span>
            </div>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full font-black text-sm py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--sidebar-active-text)' }}
          >
            <CreditCard size={16} strokeWidth={2.5} />
            Cobrar ${cartTotal.toLocaleString()}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800 animate-zoom-in">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡Venta Exitosa!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {paymentMethod === 'fiado' 
                ? `Deuda asignada a ${customerName}`
                : `Pago registrado correctamente`}
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-slate-900 dark:bg-white h-full rounded-full animate-[progress_2.5s_ease-in-out]" />
            </div>
          </div>
        </div>
      )}

      {/* Weight Modal */}
      {isWeightModalOpen && selectedWeightProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-xs w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-zoom-in">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">{selectedWeightProduct.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              ${selectedWeightProduct.price.toLocaleString()} cada {selectedWeightProduct.unit === 'kg' ? 'kg' : selectedWeightProduct.unit === 'g' ? 'g' : '100g'}
            </p>

            <div className="mb-5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                Peso en {selectedWeightProduct.unit === 'kg' ? 'kilogramos' : selectedWeightProduct.unit === 'g' ? 'gramos' : 'gramos'}
              </label>
              <div className="relative">
                <input 
                  type="number" autoFocus value={customWeight}
                  onChange={(e) => setCustomWeight(e.target.value)}
                  placeholder="0" min="0" step="1"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-12 pl-4 py-3 text-xl font-black outline-none focus:border-slate-900 dark:focus:border-slate-400 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {selectedWeightProduct.unit === 'kg' ? 'kg' : 'g'}
                </span>
              </div>
              {customWeight > 0 && (
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 text-center">
                  Total: ${(
                    selectedWeightProduct.unit === 'kg'
                      ? Number(customWeight) * selectedWeightProduct.price
                      : selectedWeightProduct.unit === 'g'
                        ? (Number(customWeight) / 1000) * selectedWeightProduct.price
                        : (Number(customWeight) / 100) * selectedWeightProduct.price
                  ).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setIsWeightModalOpen(false)} className="flex-1 py-2.5 font-bold text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Cancelar
              </button>
              <button onClick={handleCustomWeightSubmit} disabled={!customWeight || customWeight <= 0} className="flex-1 py-2.5 font-bold text-xs text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-zoom-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Registrar Gasto / Pérdida</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2 mb-4 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button onClick={() => setExpenseType('gasto')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 ${expenseType === 'gasto' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                <ArrowDownCircle size={14} /> Gasto
              </button>
              <button onClick={() => setExpenseType('perdida')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 ${expenseType === 'perdida' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                <AlertTriangle size={14} /> Pérdida
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">Concepto</label>
                <input type="text" value={expenseConcept} autoFocus
                  onChange={(e) => setExpenseConcept(e.target.value)}
                  placeholder={expenseType === 'gasto' ? "Ej: Compra de reposición" : "Ej: Producto vencido"}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-900 dark:focus:border-slate-400 dark:text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">Monto $</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input type="number" value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0" min="0" step="1"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2.5 text-sm font-bold outline-none focus:border-slate-900 dark:focus:border-slate-400 dark:text-white" />
                </div>
              </div>
            </div>

            <button onClick={registerExpense} disabled={!expenseConcept.trim() || !expenseAmount || expenseAmount <= 0}
              className="w-full py-3 rounded-xl font-black text-sm text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2">
              <ArrowDownCircle size={16} />
              Registrar {expenseType === 'gasto' ? 'Gasto' : 'Pérdida'} — ${Number(expenseAmount || 0).toLocaleString()}
            </button>
          </div>
        </div>
      )}

      {/* Cerrar Caja Modal - FULLSCREEN */}
      {isCerrarCajaModalOpen && (
        <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[70] flex flex-col animate-zoom-in">
            {/* Header */}
            <div className="bg-slate-900 dark:bg-slate-950 px-6 py-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Archive size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black">Cierre de Caja</h2>
                  <p className="text-[10px] font-bold text-slate-400">{formatCajaTime()} abierta</p>
                </div>
              </div>
              <button onClick={() => setIsCerrarCajaModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="overflow-y-auto custom-scrollbar flex-1 p-6 sm:p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                  {/* Left: Expected from system */}
                  <div className="flex-1">
                    <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Esperado (Sistema)</h3>
                    <div className="space-y-2.5">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Banknote size={16} className="text-blue-500" />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Efectivo</span>
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white">${cajaByMethod.cash.toLocaleString()}</span>
                    </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CreditCard size={16} className="text-sky-500" />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">MercadoPago</span>
                        </div>
                        <span className="text-base font-black text-slate-900 dark:text-white">${cajaByMethod.mp.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <DollarSign size={16} className="text-indigo-500" />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Transferencia</span>
                        </div>
                        <span className="text-base font-black text-slate-900 dark:text-white">${cajaByMethod.transfer.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <BookOpen size={16} className="text-slate-500" />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Fiado</span>
                        </div>
                        <span className="text-base font-black text-slate-900 dark:text-white">${cajaByMethod.fiado.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-sm font-black text-slate-500 uppercase">Total Ventas</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">${cajaTotalVentas.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-sm font-black text-slate-500 uppercase">Gastos</span>
                        <span className="text-lg font-black text-red-500">-${cajaTotalGastos.toLocaleString()}</span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/30 flex items-center justify-between">
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase">Balance Esperado</span>
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">${cajaBalance.toLocaleString()}</span>
                      </div>
                  </div>
                </div>

                {/* Right: Counted inputs */}
                <div className="flex-1">
                  <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Contado (Real)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Banknote size={13} className="text-blue-500" /> Efectivo
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                        <input type="number" value={closeCountedCash} onChange={(e) => setCloseCountedCash(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-3 font-bold text-base text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                          placeholder="0" />
                      </div>
                      {closeCountedCash !== '' && (
                        <p className={`text-[10px] font-bold mt-1 ${closeValidation.diffCash === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {closeValidation.diffCash === 0 ? 'Exacto' : `${closeValidation.diffCash > 0 ? '+' : ''}${closeValidation.diffCash.toLocaleString()} diferencia`}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <CreditCard size={13} className="text-sky-500" /> MercadoPago
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                        <input type="number" value={closeCountedMp} onChange={(e) => setCloseCountedMp(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-3 font-bold text-base text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                          placeholder="0" />
                      </div>
                      {closeCountedMp !== '' && (
                        <p className={`text-[11px] font-bold mt-1.5 ${closeValidation.diffMp === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {closeValidation.diffMp === 0 ? 'Exacto' : `${closeValidation.diffMp > 0 ? '+' : ''}${closeValidation.diffMp.toLocaleString()} diferencia`}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <DollarSign size={13} className="text-indigo-500" /> Transferencia
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                        <input type="number" value={closeCountedTransfer} onChange={(e) => setCloseCountedTransfer(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-3 font-bold text-base text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                          placeholder="0" />
                      </div>
                      {closeCountedTransfer !== '' && (
                        <p className={`text-[11px] font-bold mt-1.5 ${closeValidation.diffTransfer === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {closeValidation.diffTransfer === 0 ? 'Exacto' : `${closeValidation.diffTransfer > 0 ? '+' : ''}${closeValidation.diffTransfer.toLocaleString()} diferencia`}
                        </p>
                      )}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-500 uppercase">Total Contado</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">${closeValidation.total.toLocaleString()}</span>
                    </div>
                    {closeValidation.isReady && (
                      <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                        closeValidation.totalDiff === 0
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30'
                          : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30'
                      }`}>
                        {closeValidation.totalDiff === 0 ? <Check size={20} className="text-emerald-500" /> : <AlertTriangle size={20} className="text-amber-500" />}
                        <span className={`text-sm font-bold ${closeValidation.totalDiff === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                          {closeValidation.totalDiff === 0 ? 'Todo cuadra perfecto' : `Diferencia total: ${closeValidation.totalDiff > 0 ? '+' : ''}$${closeValidation.totalDiff.toLocaleString()}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-5 flex flex-col sm:flex-row gap-3 shrink-0">
              <button onClick={() => setIsCerrarCajaModalOpen(false)}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Seguir vendiendo
              </button>
              <button onClick={async () => {
                const business = getCurrentBusiness();
                const branchId = ensureBranchSelected();
                if (!business || !branchId) return;
                const realClose = closeValidation.isReady
                  ? closeValidation.total + cajaByMethod.fiado
                  : (cajaByMethod.cash + cajaByMethod.mp + cajaByMethod.transfer) + cajaByMethod.fiado;
                try {
                  await api.post('/cash/close', {
                    business_id: business.id, branch_id: branchId,
                    real_close: realClose, notes: closeValidation.isReady ? `E:$${closeValidation.countedCash} MP:$${closeValidation.countedMp} T:$${closeValidation.countedTransfer}` : '',
                  });
                } catch (e) { console.error(e); return; }
                setIsCerrarCajaModalOpen(false); setCajaAbierta(false); setCajaOpenTime(null);
                setCloseCountedCash(''); setCloseCountedMp(''); setCloseCountedTransfer('');
                notify.success('Caja cerrada');
              }}
                className="flex-1 py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                <Check size={16} /> Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[92vh] shadow-2xl overflow-hidden animate-zoom-in border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row">
            
            {/* Left: Summary */}
            <div className="w-full md:w-1/2 p-5 bg-slate-50/50 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Resumen</h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mb-4 max-h-48">
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 shrink-0 rounded-md overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5" /> : <Package size={12} className="text-slate-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{formatQty(item)} x ${item.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white shrink-0 ml-2">${(item.quantity * item.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discounts */}
              <div className="mb-4 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Ajuste</h4>
                <div className="flex gap-1.5 mb-1.5">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                    <input type="number" placeholder="Monto" value={discountAmount || ''}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold outline-none focus:border-slate-900 dark:text-white" />
                  </div>
                  <input type="text" placeholder="Motivo" value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none focus:border-slate-900 dark:text-white" />
                </div>
                <p className="text-[9px] text-slate-400">Negativo = descuento, Positivo = recargo</p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">${cartTotal.toLocaleString()}</span>
                </div>
                {discountAmount !== 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold ${isDiscount ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isDiscount ? 'Descuento' : 'Recargo'}
                    </span>
                    <span className={`text-xs font-bold ${isDiscount ? 'text-emerald-500' : 'text-red-500'}`}>
                      ${Number(discountAmount).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">${finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Right: Payment */}
            <div className="w-full md:w-1/2 p-5 bg-white dark:bg-slate-950 flex flex-col overflow-y-auto custom-scrollbar min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Pago</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {[
                  {id:'cash', icon: Banknote, label:'Efectivo'},
                  {id:'mp', icon: CreditCard, label:'MercadoPago'},
                  {id:'transfer', icon: DollarSign, label:'Transferencia'},
                  {id:'fiado', icon: BookOpen, label:'Anotar (Fiado)', sub:'Queda pendiente de cobro'},
                ].map(m => (
                  <button key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === m.id 
                        ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-sm' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${paymentMethod === m.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <m.icon size={18} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className={`font-bold text-xs ${paymentMethod === m.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{m.label}</p>
                      {m.sub && <p className="text-[10px] text-slate-400">{m.sub}</p>}
                    </div>
                    {paymentMethod === m.id && <Check size={16} className="text-slate-900 dark:text-white shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Cash Calculator */}
              {paymentMethod === 'cash' && (
                <div className="mb-4 animate-fadeIn">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Calculadora de vuelto</span>
                    <button onClick={() => setCashPaid(0)} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Limpiar</button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 mb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Paga con:</span>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                        <input type="number" value={cashPaid || ''}
                          onChange={(e) => setCashPaid(Number(e.target.value))}
                          className="w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg pl-5 pr-2 py-1 text-right font-bold text-sm outline-none focus:border-indigo-500 dark:text-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Vuelto:</span>
                      <span className={`text-base font-black ${cashPaid >= finalTotal ? 'text-emerald-500' : 'text-red-500'}`}>
                        ${Math.max(0, cashPaid - finalTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {bills.map(bill => (
                      <button key={bill} onClick={() => setCashPaid(prev => prev + bill)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:border-emerald-800 transition-colors">
                        +${bill.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Selector */}
              <div className="mb-4 animate-fadeIn">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                  Cliente {paymentMethod === 'fiado' ? '(obligatorio)' : '(opcional)'}
                </span>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex gap-1.5 mb-3 p-0.5 bg-slate-200 dark:bg-slate-900 rounded-lg">
                    <button onClick={() => setIsNewCustomer(true)}
                      className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${isNewCustomer ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                      Nuevo
                    </button>
                    <button onClick={() => { setIsNewCustomer(false); setSelectedCustomerId(null); setCustomerName(''); }}
                      className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${!isNewCustomer ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                      Existente
                    </button>
                  </div>
                  
                  {!isNewCustomer ? (
                    <div className="relative" ref={customerRef}>
                      <input type="text" 
                        value={customerSearch}
                        onChange={(e) => { setCustomerSearch(e.target.value); setIsCustomerDropdownOpen(true); setSelectedCustomerId(null); }}
                        onFocus={() => setIsCustomerDropdownOpen(true)}
                        placeholder="Buscar cliente..." 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:text-white" />
                      {isCustomerDropdownOpen && customerSearch && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto">
                          {customers.filter(c => c.name?.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 ? (
                            <div className="px-3 py-2 text-xs text-slate-400">No se encontraron clientes</div>
                          ) : (
                            customers.filter(c => c.name?.toLowerCase().includes(customerSearch.toLowerCase())).slice(0, 8).map(c => (
                              <div key={c.id}
                                onClick={() => { setSelectedCustomerId(c.id); setCustomerName(c.name); setCustomerSearch(c.name); setIsCustomerDropdownOpen(false); }}
                                className={`px-3 py-2 text-xs font-bold cursor-pointer transition-colors ${selectedCustomerId === c.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                {c.name} {c.phone && <span className="text-slate-400 font-medium ml-1">· {c.phone}</span>}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <input type="text" value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nombre del cliente"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:text-white" />
                      <input type="text" placeholder="Teléfono (opcional)"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:text-white mt-2" />
                    </>
                  )}
                </div>
              </div>

              {/* ARCA Invoice Toggle */}
              <div className="mb-4 animate-fadeIn border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Factura Electrónica ARCA</span>
                  </div>
                  <button
                    onClick={() => setShouldInvoice(!shouldInvoice)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${shouldInvoice ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${shouldInvoice ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                {shouldInvoice && (
                  <div className="animate-fadeIn space-y-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex gap-1.5">
                      {['B', 'A', 'ticket'].map(type => {
                        const label = type === 'B' ? 'Factura B' : type === 'A' ? 'Factura A' : 'Ticket';
                        return (
                          <button key={type}
                            onClick={() => setInvoiceReceiptType(type)}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${invoiceReceiptType === type ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <input type="text" value={invoiceCustomerName}
                      onChange={(e) => setInvoiceCustomerName(e.target.value)}
                      placeholder="Cliente (razón social o nombre)"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:text-white" />
                    {!arcaConfig?.cuit && (
                      <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle size={11} />
                        Completá tus datos fiscales en Configuración
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button onClick={confirmPayment}
                className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black text-sm py-3.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98] mt-auto">
                Confirmar Pago — ${finalTotal.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceModalOpen && lastInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-zoom-in border border-slate-200 dark:border-slate-800">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 text-white">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <FileText size={20} />
                  <h2 className="text-lg font-display font-black">Comprobante Emitido</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold">
                  {lastInvoice.receiptType === 'ticket' ? 'Ticket' : `Factura ${lastInvoice.receiptType}`}
                </div>
              </div>
              <p className="text-sm opacity-90 font-medium mt-1">N° {lastInvoice.number}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle size={28} className="text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-center text-sm font-bold text-slate-900 dark:text-white">Factura emitida correctamente</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-2.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Emisor</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{lastInvoice.businessName}</p>
                  <p className="text-[10px] text-slate-500">CUIT {lastInvoice.cuit}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-2.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Cliente</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{lastInvoice.customerName}</p>
                  <p className="text-[10px] text-slate-500">{lastInvoice.customerCuit}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="space-y-1.5">
                  {lastInvoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                {lastInvoice.discount !== 0 && (
                  <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Ajuste</span>
                    <span className="font-bold text-slate-600">${Number(lastInvoice.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-black text-slate-500 uppercase">Total</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">${lastInvoice.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => {
                  setIsInvoiceModalOpen(false);
                  setCart([]);
                  setIsSuccessModalOpen(false);
                  setPaymentMethod('cash');
                  setCustomerName('');
                  setSelectedCustomerId(null);
                  setCustomerSearch('');
                  setIsNewCustomer(true);
                  setDiscountAmount(0);
                  setDiscountReason('');
                  setCashPaid(0);
                  setShouldInvoice(false);
                  setInvoiceCustomerName('');
                }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5">
                  <Printer size={14} />
                  Imprimir
                </button>
                <button onClick={() => {
                  setIsInvoiceModalOpen(false);
                  setCart([]);
                  setIsSuccessModalOpen(false);
                  setPaymentMethod('cash');
                  setCustomerName('');
                  setSelectedCustomerId(null);
                  setCustomerSearch('');
                  setIsNewCustomer(true);
                  setDiscountAmount(0);
                  setDiscountReason('');
                  setCashPaid(0);
                  setShouldInvoice(false);
                  setInvoiceCustomerName('');
                }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5">
                  <Check size={14} />
                  Listo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
