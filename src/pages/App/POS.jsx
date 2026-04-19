import React, { useState, useRef, useEffect } from 'react';
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
  Archive
} from 'lucide-react';
import ProductCard from '../../shared/components/ProductCard';
import { getCategoryById } from '../Admin/config/productCategories';

import imgBebidas from './images/categories/bebidas.png';
import imgGaseosas from './images/categories/gaseosas.png';
import imgToallitas from './images/categories/toallitas humedas.png';

const POS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [paymentMethod, setPaymentMethod] = useState('efectivo'); // efectivo, tarjeta, fiado
  const [customerName, setCustomerName] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [selectedWeightProduct, setSelectedWeightProduct] = useState(null);
  const [customWeight, setCustomWeight] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const [posBranch, setPosBranch] = useState('centro');
  const [isPosBranchDropdownOpen, setIsPosBranchDropdownOpen] = useState(false);
  const posBranchRef = useRef(null);

  const [isCajaDropdownOpen, setIsCajaDropdownOpen] = useState(false);
  const cajaRef = useRef(null);

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

  // States para ofertas y calculadora de efectivo
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  const [cashPaid, setCashPaid] = useState(0);
  
  // Mock products for POS
  const [products] = useState([
    { id: 1, name: 'Coca Cola 500ml', price: 1200, category: ['gaseosas'], stock: 100, image: imgGaseosas },
    { id: 2, name: 'Cerveza Quilmes 1L', price: 2500, category: ['cervezas'], stock: 80, image: imgBebidas },
    { id: 3, name: 'Agua Mineral 2L', price: 800, category: ['aguas'], stock: 150, image: imgBebidas },
    { id: 4, name: 'Jugo Naranja 1L', price: 1500, category: ['jugos'], stock: 60, image: imgBebidas },
    { id: 5, name: 'Energizante Red Bull', price: 2200, category: ['energizantes'], stock: 45, image: imgBebidas },
    { id: 6, name: 'Alfajor Jorgito', price: 800, category: ['alfajores'], stock: 90, useIcon: true },
    { id: 7, name: 'Chocolate Milka', price: 2200, category: ['chocolates'], stock: 65, useIcon: true },
    { id: 8, name: 'Galletitas Oreo', price: 1600, category: ['galletitas'], stock: 75, useIcon: true },
    { id: 9, name: 'Papas Fritas Lays', price: 1400, category: ['papas-fritas'], stock: 85, useIcon: true },
    { id: 10, name: 'Caramelos Sugus', price: 600, category: ['caramelos'], stock: 120, useIcon: true },
    { id: 11, name: 'Vino Rutini Malbec', price: 8500, category: ['vinos'], stock: 25, image: imgBebidas },
    { id: 12, name: 'Fernet Branca 1L', price: 7200, category: ['aperitivos'], stock: 40, image: imgBebidas },
    { id: 13, name: 'Leche La Serenísima 1L', price: 1100, category: ['leche'], stock: 50, useIcon: true },
    { id: 14, name: 'Queso Cremoso 300g', price: 2800, category: ['quesos'], stock: 30, useIcon: true },
    { id: 15, name: 'Shampoo Pantene 400ml', price: 3500, category: ['shampoo'], stock: 20, useIcon: true },
    { id: 16, name: 'Desodorante Rexona', price: 1900, category: ['desodorantes'], stock: 35, useIcon: true },
    { id: 17, name: 'Ibuprofeno 400mg', price: 1200, category: ['analgesicos'], stock: 80, useIcon: true },
    { id: 18, name: 'Pañales Pampers M', price: 9500, category: ['panales'], stock: 15, useIcon: true },
    { id: 19, name: 'Té La Virginia', price: 1200, category: ['te-cafe'], stock: 45, useIcon: true },
    { id: 20, name: 'Pan Bimbo Blanco', price: 2100, category: ['pan'], stock: 25, useIcon: true },
    { id: 21, name: 'Fideos Matarazzo', price: 1300, category: ['arroz-pastas'], stock: 40, useIcon: true },
    { id: 22, name: 'Lavandina Ayudín 1L', price: 900, category: ['lavandina'], stock: 60, useIcon: true },
    { id: 23, name: 'Sprite 2L', price: 2100, category: ['gaseosas'], stock: 80, image: imgGaseosas },
    { id: 24, name: 'Fanta 1.5L', price: 1800, category: ['gaseosas'], stock: 60, image: imgGaseosas },
    { id: 25, name: 'Schweppes Pomelo 1.5L', price: 1900, category: ['gaseosas'], stock: 40, image: imgGaseosas },
    { id: 26, name: 'Gatorade 250ml', price: 1800, category: ['energizantes'], stock: 30, image: imgBebidas },
    { id: 27, name: 'Toallitas Húmedas Pampers', price: 2800, category: ['cuidado-personal'], stock: 45, image: imgToallitas },
    { id: 28, name: 'Toallitas Femeninas Siempre Libre', price: 1500, category: ['cuidado-personal'], stock: 55, image: imgToallitas },
    { id: 29, name: 'Toallitas Desmaquillantes Nivea', price: 3200, category: ['cuidado-personal'], stock: 25, image: imgToallitas },
    // Nuevos productos por peso (precio base cada 100g)
    { id: 30, name: 'Salame Milán', price: 850, category: ['fiambres'], stock: 50, unit: '100g', useIcon: true },
    { id: 31, name: 'Queso Tybo', price: 650, category: ['fiambres'], stock: 80, unit: '100g', useIcon: true },
    { id: 32, name: 'Queso Roquefort', price: 1200, category: ['fiambres'], stock: 30, unit: '100g', useIcon: true },
    { id: 33, name: 'Pan Francés', price: 200, category: ['pan'], stock: 100, unit: '100g', useIcon: true },
  ]);

  const [maxPrice, setMaxPrice] = useState('all');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category.includes(selectedCategory);
    let matchesPrice = true;
    if (maxPrice !== 'all') {
      matchesPrice = p.price <= parseInt(maxPrice);
    }
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const categories = ['all', ...new Set(products.flatMap(p => p.category))];

  const addToCart = (product, weight = null) => {
    if (product.unit === '100g' && !weight) {
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
    
    // Si ingresa 2500g, guardamos 25 (porque el precio es por cada 100g)
    const weightInHundreds = Number(customWeight) / 100;
    addToCart(selectedWeightProduct, weightInHundreds);
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

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const confirmPayment = () => {
    if (paymentMethod === 'fiado' && !customerName.trim()) {
      alert('Debe ingresar o seleccionar un cliente para fiar.');
      return;
    }
    
    // Logica real de venta
    setIsPaymentModalOpen(false);
    setIsSuccessModalOpen(true);
    
    // Resetear form tras 2.5s
    setTimeout(() => {
      setCart([]);
      setIsSuccessModalOpen(false);
      setPaymentMethod('efectivo');
      setCustomerName('');
      setDiscountAmount(0);
      setDiscountReason('');
      setCashPaid(0);
    }, 2500);
  };

  // Funciones helper
  const finalTotal = cartTotal + Number(discountAmount);
  const isDiscount = discountAmount < 0;
  const isSurcharge = discountAmount > 0;
  
  const bills = [10, 20, 50, 100, 200, 500, 1000, 2000, 10000, 20000];

  const formatQty = (item) => {
    if (item.unit === '100g') {
      const grams = item.quantity * 100;
      if (grams >= 1000) {
        return `${(grams / 1000).toFixed(2).replace(/\.00$/, '')}kg`;
      }
      return `${Math.round(grams)}g`;
    }
    return item.quantity;
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-slate-50/50 dark:bg-slate-950 relative overflow-hidden">
      
      {/* Botón flotante para abrir carrito en mobile */}
      {!isCartOpen && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center"
        >
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
              {cart.length}
            </span>
          )}
        </button>
      )}

      {/* Left Area: Products Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header Dinámico */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm p-4 lg:p-6 z-20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 lg:mb-0">
            <div className="flex items-center justify-between w-full lg:w-auto">
              <div>
                <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Punto de Venta</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Selecciona productos para añadir al carrito</p>
              </div>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
              
              {/* Selector de Sucursal POS */}
              <div className="relative" ref={posBranchRef}>
                <button 
                  onClick={() => setIsPosBranchDropdownOpen(!isPosBranchDropdownOpen)}
                  className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm min-w-[160px]"
                >
                  <div className="flex items-center gap-2">
                    <Store size={16} className="text-indigo-500" />
                    <span>
                      {posBranch === 'centro' ? 'Sucursal Centro' : 'Sucursal Norte'}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isPosBranchDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPosBranchDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                    <div 
                      className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors flex items-center justify-between ${posBranch === 'centro' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      onClick={() => { setPosBranch('centro'); setIsPosBranchDropdownOpen(false); }}
                    >
                      Sucursal Centro
                      {posBranch === 'centro' && <Check size={16} />}
                    </div>
                    <div 
                      className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors flex items-center justify-between border-t border-slate-100 dark:border-slate-800 ${posBranch === 'norte' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      onClick={() => { setPosBranch('norte'); setIsPosBranchDropdownOpen(false); }}
                    >
                      Sucursal Norte
                      {posBranch === 'norte' && <Check size={16} />}
                    </div>
                  </div>
                )}
              </div>

              {/* Selector de Caja */}
              <div className="relative" ref={cajaRef}>
                <button 
                  onClick={() => setIsCajaDropdownOpen(!isCajaDropdownOpen)}
                  className="flex items-center justify-between gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Archive size={16} />
                    <span>Caja: Abierta</span>
                  </div>
                  <ChevronDown size={14} className={`text-emerald-600 dark:text-emerald-500 transition-transform ${isCajaDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCajaDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                    <div className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-2">
                      <Banknote size={16} className="text-emerald-500" />
                      Ingreso / Egreso
                    </div>
                    <div className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                      <BookOpen size={16} className="text-indigo-500" />
                      Ver Arqueo Actual
                    </div>
                    <div className="px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition-colors flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                      <X size={16} />
                      Cerrar Caja
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="flex justify-between items-center gap-4">
            <div className="flex flex-1 items-center gap-3">
              {/* Buscador expandido en móvil */}
              <div className="flex-1 sm:w-64 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-colors shadow-sm dark:text-white"
                />
              </div>

              {/* Botón de Filtros / Categorías */}
              <button 
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors border shadow-sm ${
                  isFiltersOpen || selectedCategory !== 'all' || maxPrice !== 'all'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                }`}
              >
                Filtros
                {(selectedCategory !== 'all' || maxPrice !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>

              {/* View Mode Toggle (Solo Desktop) */}
              <div className="hidden sm:flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm shrink-0">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  title="Vista Cuadrícula"
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  title="Vista Lista"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Panel Desplegable de Filtros Animado */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isFiltersOpen ? 'max-h-96 opacity-100 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800' : 'max-h-0 opacity-0 m-0 p-0 border-transparent'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Filtro por Categorías (Reemplaza a la barra horizontal) */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Categoría</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === cat 
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat === 'all' ? 'Todas' : getCategoryById(cat)?.name || cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro por Precio */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Presupuesto (Qué me alcanza)</h3>
                <div className="relative">
                  <select
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-slate-900 dark:focus:border-slate-400 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="all">Sin límite</option>
                    <option value="1000">Hasta $1.000</option>
                    <option value="2000">Hasta $2.000</option>
                    <option value="5000">Hasta $5.000</option>
                    <option value="10000">Hasta $10.000</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>
              
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setMaxPrice('all');
                  setSearchTerm('');
                }}
                className="text-sm font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 pb-24 lg:pb-6">
          <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
            {filteredProducts.map(product => {
              const cat = getCategoryById(product.category[0]);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryData={cat}
                  viewMode={viewMode}
                  onClick={() => addToCart(product)}
                  showActions={false}
                  className="hover:border-slate-400 dark:hover:border-slate-500 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
                />
              );
            })}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium text-lg">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Cart / POS Panel (Slide-over on mobile, toggleable on desktop) */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 lg:static lg:z-10 lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl lg:shadow-[-4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Carrito Actual</h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{cart.length} {cart.length === 1 ? 'ítem' : 'ítems'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button 
                onClick={clearCart}
                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                title="Vaciar carrito"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button 
              onClick={() => setIsCartOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-4 opacity-70">
              <ShoppingCart size={64} strokeWidth={1} />
              <p className="font-medium text-sm">El carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  
                  {/* Imagen o Ícono en el Carrito */}
                  <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <LayoutGrid size={20} className="text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.name}</h4>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      ${item.price.toLocaleString()} {item.unit ? <span className="text-[10px] font-medium opacity-70">/ {item.unit}</span> : ''}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <button 
                        onClick={() => updateQuantity(item.id, item.unit === '100g' ? -1 : -1)}
                        className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-12 text-center font-bold text-xs dark:text-white truncate" title={formatQty(item)}>
                        {formatQty(item)}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.unit === '100g' ? 1 : 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1"
                    >
                      <Trash2 size={10} /> Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer / Checkout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center text-sm font-bold text-slate-500 dark:text-slate-400">
              <span>Subtotal</span>
              <span>${cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-100 dark:border-slate-800">
              <span>Total</span>
              <span className="text-slate-900 dark:text-white">${cartTotal.toLocaleString()}</span>
            </div>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-lg py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            Cobrar ${cartTotal.toLocaleString()}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800 animate-zoom-in">
            <div className="w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-900/20 dark:shadow-white/20">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡Venta Exitosa!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {paymentMethod === 'fiado' 
                ? `La deuda ha sido asignada a ${customerName}`
                : `El pago ha sido registrado correctamente`}
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-slate-900 dark:bg-white h-full animate-[progress_2.5s_ease-in-out]" />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ingreso de Peso Personalizado */}
      {isWeightModalOpen && selectedWeightProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-zoom-in">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Añadir {selectedWeightProduct.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Precio: ${selectedWeightProduct.price} cada 100g</p>
            
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Gramos exactos (ej. 2143)</label>
              <div className="relative">
                <input 
                  type="number"
                  autoFocus
                  value={customWeight}
                  onChange={(e) => setCustomWeight(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-4 py-3 text-xl font-black outline-none focus:border-blue-500 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">g</span>
              </div>
              {customWeight > 0 && (
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2 text-center">
                  Total a cobrar: ${(Number(customWeight) / 100 * selectedWeightProduct.price).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsWeightModalOpen(false)}
                className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCustomWeightSubmit}
                disabled={!customWeight || customWeight <= 0}
                className="flex-1 py-3 font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-zoom-in border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row">
            
            {/* Left Column: Cart Summary & Discounts */}
            <div className="w-full md:w-1/2 p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-6">Resumen de Venta</h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <LayoutGrid size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{formatQty(item)} x ${item.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">${(item.quantity * item.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adjust Price / Discounts */}
              <div className="mb-6 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Aplicar Oferta / Recargo</h4>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      placeholder="Monto (+ o -)"
                      value={discountAmount || ''}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm font-bold outline-none focus:border-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Motivo (ej: Promo)"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Usa un número negativo para descontar (ej: -500).</p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Subtotal</p>
                  <p className="text-slate-900 dark:text-white font-bold">${cartTotal.toLocaleString()}</p>
                </div>
                
                {discountAmount !== 0 && (
                  <div className="flex justify-between items-center mb-4">
                    <p className={`font-medium ${isDiscount ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isDiscount ? 'Descuento' : 'Recargo'} {discountReason && `(${discountReason})`}
                    </p>
                    <p className={`font-bold ${isDiscount ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isDiscount ? '' : '+'}${Number(discountAmount).toLocaleString()}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-end mt-4">
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Total a cobrar</p>
                  <div className="text-right">
                    {discountAmount !== 0 && (
                      <p className="text-sm font-bold text-slate-400 line-through mb-1">${cartTotal.toLocaleString()}</p>
                    )}
                    <p className="text-4xl font-display font-bold text-slate-900 dark:text-white">${finalTotal.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Methods */}
            <div className="w-full md:w-1/2 p-6 md:p-8 bg-white dark:bg-slate-950 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Método de Pago</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors ${
                      paymentMethod === 'efectivo' 
                        ? 'border-slate-900 bg-slate-50 dark:bg-slate-800 dark:border-white shadow-sm' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'efectivo' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      <Banknote size={20} />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-bold ${paymentMethod === 'efectivo' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>Efectivo</p>
                    </div>
                    {paymentMethod === 'efectivo' && <Check size={20} className="text-slate-900 dark:text-white" />}
                  </button>

                  <button 
                    onClick={() => setPaymentMethod('tarjeta')}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors ${
                      paymentMethod === 'tarjeta' 
                        ? 'border-slate-900 bg-slate-50 dark:bg-slate-800 dark:border-white shadow-sm' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'tarjeta' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-bold ${paymentMethod === 'tarjeta' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>Tarjeta / Transferencia</p>
                    </div>
                    {paymentMethod === 'tarjeta' && <Check size={20} className="text-slate-900 dark:text-white" />}
                  </button>

                  <button 
                    onClick={() => setPaymentMethod('fiado')}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors ${
                      paymentMethod === 'fiado' 
                        ? 'border-slate-900 bg-slate-50 dark:bg-slate-800 dark:border-white shadow-sm' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'fiado' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      <BookOpen size={20} />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-bold ${paymentMethod === 'fiado' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>Anotar (Fiado)</p>
                      <p className={`text-xs font-medium ${paymentMethod === 'fiado' ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-500'}`}>Quedará pendiente de cobro</p>
                    </div>
                    {paymentMethod === 'fiado' && <Check size={20} className="text-slate-900 dark:text-white" />}
                  </button>
                </div>
              </div>

              {/* Cash Calculator if Efectivo is selected */}
              {paymentMethod === 'efectivo' && (
                <div className="mb-6 animate-fadeIn">
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Calculadora de Vuelto</label>
                    <button 
                      onClick={() => setCashPaid(0)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Limpiar
                    </button>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Paga con:</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input 
                          type="number"
                          value={cashPaid || ''}
                          onChange={(e) => setCashPaid(Number(e.target.value))}
                          className="w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg pl-7 pr-2 py-1.5 text-right font-bold text-lg outline-none focus:border-blue-500 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Vuelto:</span>
                      <span className={`text-xl font-black ${cashPaid >= finalTotal ? 'text-emerald-500' : 'text-red-500'}`}>
                        ${Math.max(0, cashPaid - finalTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {bills.map(bill => (
                      <button
                        key={bill}
                        onClick={() => setCashPaid(prev => prev + bill)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:border-emerald-800 transition-colors shadow-sm"
                      >
                        +${bill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Input if Fiado is selected */}
              {paymentMethod === 'fiado' && (
                <div className="mb-6 animate-fadeIn">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 block">Datos del Cliente</label>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2 mb-4 p-1 bg-slate-200 dark:bg-slate-900 rounded-lg">
                      <button 
                        onClick={() => setIsNewCustomer(true)}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${isNewCustomer ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        Nuevo Cliente
                      </button>
                      <button 
                        onClick={() => setIsNewCustomer(false)}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${!isNewCustomer ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        Existente
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          {isNewCustomer ? 'Nombre completo' : 'Buscar cliente'}
                        </label>
                        <input 
                          type="text" 
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder={isNewCustomer ? "Ej: Juan Pérez" : "Escribe para buscar..."}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-colors dark:text-white"
                        />
                      </div>
                      
                      {isNewCustomer && (
                        <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Teléfono (opcional)</label>
                          <input 
                            type="text" 
                            placeholder="Ej: +54 11 1234-5678"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-colors dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={confirmPayment}
                className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-lg py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors mt-auto"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;