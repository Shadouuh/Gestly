import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  ChevronDown,
  X,
  Check,
  Camera,
  Sparkles,
  Upload,
  Loader2,
  LayoutGrid,
  List,
  Store
} from 'lucide-react';
import ProductCard from '../../shared/components/ProductCard';
import { getCategoryById, productCategories } from '../Admin/config/productCategories';

const Catalog = () => {
  const { selectedBranch } = useOutletContext();
  const [catalogBranch, setCatalogBranch] = useState('all');
  const [isCatalogBranchDropdownOpen, setIsCatalogBranchDropdownOpen] = useState(false);
  const catalogBranchRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, low_stock
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    purchasePrice: '',
    price: '',
    stock: '',
    category: 'gaseosas',
    image: '',
    useIcon: true
  });
  
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'Package',
    color: 'blue'
  });

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  const [isCatColorDropdownOpen, setIsCatColorDropdownOpen] = useState(false);
  const [isCatIconDropdownOpen, setIsCatIconDropdownOpen] = useState(false);
  const [isProductCatDropdownOpen, setIsProductCatDropdownOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiStep, setAiStep] = useState('intro'); // intro, scanning, review
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  const [scannedItems, setScannedItems] = useState([
    { id: 's1', name: 'Coca Cola 2.25L', purchasePrice: 1500, price: 2500, category: 'gaseosas', selected: true },
    { id: 's2', name: 'Sprite 1.5L', purchasePrice: 1100, price: 1800, category: 'gaseosas', selected: true },
    { id: 's3', name: 'Papas Lays 150g', purchasePrice: 800, price: 1200, category: 'snacks', selected: true },
    { id: 's4', name: 'Cerveza Brahma 1L', purchasePrice: 1200, price: 1900, category: 'cervezas', selected: true },
    { id: 's5', name: 'Yerba Taragüi 500g', purchasePrice: 900, price: 1400, category: 'te-cafe', selected: true },
    { id: 's6', name: 'Galletitas surtidas', purchasePrice: 600, price: 1000, category: 'galletitas', selected: true },
  ]);

  const catColorRef = useRef(null);
  const catIconRef = useRef(null);
  const productCatRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (catColorRef.current && !catColorRef.current.contains(event.target)) {
        setIsCatColorDropdownOpen(false);
      }
      if (catIconRef.current && !catIconRef.current.contains(event.target)) {
        setIsCatIconDropdownOpen(false);
      }
      if (productCatRef.current && !productCatRef.current.contains(event.target)) {
        setIsProductCatDropdownOpen(false);
      }
      if (catalogBranchRef.current && !catalogBranchRef.current.contains(event.target)) {
        setIsCatalogBranchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScannedItemChange = (id, field, value) => {
    setScannedItems(items => items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const toggleScannedItemSelection = (id) => {
    setScannedItems(items => items.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const toggleAllScannedItems = () => {
    const allSelected = scannedItems.every(i => i.selected);
    setScannedItems(items => items.map(item => ({ ...item, selected: !allSelected })));
  };

  const handleInlinePriceChange = (id, field, value) => {
    const numValue = parseFloat(value) || 0;
    setProducts(products.map(p => p.id === id ? { ...p, [field]: numValue } : p));
  };

  const [products, setProducts] = useState([
    { id: 1, name: 'Coca Cola 500ml', purchasePrice: 800, price: 1200, category: ['gaseosas'], stock: { centro: 5, norte: 0 }, branches: ['centro', 'norte'], useIcon: false, image: '/src/pages/App/images/categories/bebidas.png' },
    { id: 2, name: 'Cerveza Quilmes 1L', purchasePrice: 1800, price: 2500, category: ['cervezas'], stock: { centro: 40, norte: 40 }, branches: ['centro', 'norte'], useIcon: false, image: '/src/pages/App/images/categories/bebidas.png' },
    { id: 3, name: 'Agua Mineral 2L', purchasePrice: 500, price: 800, category: ['aguas'], stock: { centro: 100, norte: 50 }, branches: ['centro', 'norte'], useIcon: false, image: '/src/pages/App/images/categories/bebidas.png' },
    { id: 4, name: 'Jugo Naranja 1L', purchasePrice: 900, price: 1500, category: ['jugos'], stock: { centro: 30, norte: 30 }, branches: ['centro', 'norte'], useIcon: false, image: '/src/pages/App/images/categories/bebidas.png' },
    { id: 5, name: 'Energizante Red Bull', purchasePrice: 1500, price: 2200, category: ['energizantes'], stock: { centro: 45, norte: 0 }, branches: ['centro'], useIcon: false, image: '/src/pages/App/images/categories/bebidas.png' },
    { id: 6, name: 'Alfajor Jorgito', purchasePrice: 500, price: 800, category: ['alfajores'], stock: { centro: 2, norte: 0 }, branches: ['centro'], useIcon: true },
    { id: 8, name: 'Galletitas Oreo', purchasePrice: 1100, price: 1600, category: ['galletitas'], stock: { centro: 0, norte: 0 }, branches: ['centro', 'norte'], useIcon: true },
    { id: 10, name: 'Caramelos Sugus', purchasePrice: 300, price: 600, category: ['caramelos'], stock: { centro: 60, norte: 60 }, branches: ['centro', 'norte'], useIcon: true },
    { id: 11, name: 'Vino Rutini Malbec', purchasePrice: 6000, price: 8500, category: ['vinos'], stock: { centro: 15, norte: 10 }, branches: ['centro', 'norte'], useIcon: true },
    { id: 12, name: 'Fernet Branca 1L', purchasePrice: 5500, price: 7200, category: ['aperitivos'], stock: { centro: 20, norte: 20 }, branches: ['centro', 'norte'], useIcon: true },
    { id: 13, name: 'Leche La Serenísima 1L', purchasePrice: 800, price: 1100, category: ['leche'], stock: { centro: 25, norte: 25 }, branches: ['centro', 'norte'], useIcon: true },
    { id: 14, name: 'Queso Cremoso 300g', purchasePrice: 2000, price: 2800, category: ['quesos'], stock: { centro: 10, norte: 20 }, branches: ['centro', 'norte'], useIcon: true },
    { id: 15, name: 'Shampoo Pantene 400ml', purchasePrice: 2500, price: 3500, category: ['shampoo'], stock: { centro: 20, norte: 0 }, branches: ['centro'], useIcon: false, image: '/src/pages/App/images/categories/toallitas.png' },
    { id: 16, name: 'Desodorante Rexona', purchasePrice: 1300, price: 1900, category: ['desodorantes'], stock: { centro: 35, norte: 0 }, branches: ['centro'], useIcon: false, image: '/src/pages/App/images/categories/toallitas.png' },
    { id: 17, name: 'Ibuprofeno 400mg', purchasePrice: 800, price: 1200, category: ['analgesicos'], stock: { centro: 40, norte: 40 }, branches: ['centro', 'norte'], useIcon: true },
    { id: 18, name: 'Pañales Pampers M', purchasePrice: 7000, price: 9500, category: ['panales'], stock: { centro: 5, norte: 10 }, branches: ['centro', 'norte'], useIcon: false, image: '/src/pages/App/images/categories/toallitas.png' },
    { id: 19, name: 'Té La Virginia', purchasePrice: 800, price: 1200, category: ['te-cafe'], stock: { centro: 2, norte: 2 }, branches: ['centro', 'norte'], useIcon: true },
    { id: 20, name: 'Pan Bimbo Blanco', purchasePrice: 1500, price: 2100, category: ['pan'], stock: { centro: 15, norte: 10 }, branches: ['centro', 'norte'], useIcon: true },
    { id: 21, name: 'Fideos Matarazzo', purchasePrice: 900, price: 1300, category: ['arroz-pastas'], stock: { centro: 20, norte: 20 }, branches: ['centro', 'norte'], useIcon: true },
    { id: 22, name: 'Lavandina Ayudín 1L', purchasePrice: 600, price: 900, category: ['lavandina'], stock: { centro: 6, norte: 0 }, branches: ['centro'], useIcon: true },
  ]);

  const categories = ['all', ...new Set(products.flatMap(p => p.category))];

  const getBranchStock = (p, branch) => {
    if (branch === 'all') {
       return Object.values(p.stock || {}).reduce((a,b) => a+b, 0);
    }
    return p.stock?.[branch] || 0;
  };

  const filteredProducts = products.filter(p => {
    const stockValue = getBranchStock(p, catalogBranch);
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'low_stock' ? stockValue <= 10 : true;
    const matchesCategory = selectedCategory === 'all' || p.category.includes(selectedCategory);
    const matchesBranch = catalogBranch === 'all' || p.branches.includes(catalogBranch);
    return matchesSearch && matchesTab && matchesCategory && matchesBranch;
  }).map(p => ({ ...p, stock: getBranchStock(p, catalogBranch) }));

  const lowStockCount = filteredProducts.filter(p => p.stock <= 10).length;
  const totalValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalCost = filteredProducts.reduce((sum, p) => sum + (p.purchasePrice * p.stock), 0);

  return (
    <div className="p-6 flex flex-col max-w-7xl mx-auto w-full">
      
      {/* Onboarding Banner IA */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white mb-8 shadow-2xl shadow-slate-900/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none transition-all duration-700 group-hover:bg-indigo-500/20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none transition-all duration-700 group-hover:bg-blue-500/20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 mb-4 backdrop-blur-sm">
              <Sparkles className="text-indigo-400" size={14} />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Nuevo: IA Gestly</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-black mb-3 text-white">
              No cargues tus productos a mano.
            </h2>
            <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
              Ey, si tenés tus precios anotados en una libreta o en listas de proveedores, nuestra Inteligencia Artificial los lee, asigna categorías e imágenes automáticamente. ¡Probá la magia!
            </p>
          </div>
          <button 
            onClick={() => { setAiStep('intro'); setIsAiModalOpen(true); }}
            className="shrink-0 bg-indigo-600 border border-indigo-500/50 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-500 hover:-translate-y-1 transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95"
          >
            <Camera size={18} />
            Importar con Foto
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Mi Catálogo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestiona inventario y precios {selectedBranch !== 'all' ? `para Sucursal ${selectedBranch === 'centro' ? 'Centro' : 'Norte'}` : 'global'}
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative" ref={catalogBranchRef}>
            <button 
              onClick={() => setIsCatalogBranchDropdownOpen(!isCatalogBranchDropdownOpen)}
              className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm min-w-[200px]"
            >
              <div className="flex items-center gap-2">
                <Store size={16} className="text-slate-400" />
                <span>
                  {catalogBranch === 'all' ? 'Todas las Sucursales' : catalogBranch === 'centro' ? 'Sucursal Centro' : 'Sucursal Norte'}
                </span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCatalogBranchDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCatalogBranchDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                <div 
                  className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors flex items-center justify-between ${catalogBranch === 'all' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  onClick={() => { setCatalogBranch('all'); setIsCatalogBranchDropdownOpen(false); }}
                >
                  Global (Consolidado)
                  {catalogBranch === 'all' && <Check size={16} />}
                </div>
                <div 
                  className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors flex items-center justify-between border-t border-slate-100 dark:border-slate-800 ${catalogBranch === 'centro' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  onClick={() => { setCatalogBranch('centro'); setIsCatalogBranchDropdownOpen(false); }}
                >
                  Sucursal Centro
                  {catalogBranch === 'centro' && <Check size={16} />}
                </div>
                <div 
                  className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors flex items-center justify-between border-t border-slate-100 dark:border-slate-800 ${catalogBranch === 'norte' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  onClick={() => { setCatalogBranch('norte'); setIsCatalogBranchDropdownOpen(false); }}
                >
                  Sucursal Norte
                  {catalogBranch === 'norte' && <Check size={16} />}
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
          >
            <Plus size={18} />
            Añadir Producto
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Total Productos */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-900 p-5 rounded-3xl shadow-xl shadow-blue-900/20 relative overflow-hidden text-white border border-blue-500/30 group hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <svg className="absolute bottom-0 left-0 w-full h-24 opacity-20 pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">Total Productos</p>
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Package size={16} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-black tracking-tight mb-1">{products.length}</p>
              <p className="text-xs text-blue-200 font-medium">Ítems en catálogo</p>
            </div>
          </div>
        </div>

        {/* Valor de Inventario */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-5 rounded-3xl shadow-xl shadow-emerald-900/20 relative overflow-hidden text-white border border-emerald-500/30 group hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Valor de Inventario</p>
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-black tracking-tight mb-2">${totalValue.toLocaleString()}</p>
              <div className="flex justify-between items-center text-xs font-medium text-emerald-100 bg-emerald-950/30 p-2 rounded-lg backdrop-blur-sm">
                <span className="flex items-center gap-1">Costo: ${totalCost.toLocaleString()}</span>
                <span className="flex items-center gap-1 font-bold text-emerald-300">Ganancia: ${(totalValue - totalCost).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Crítico */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden text-white border border-slate-700 group hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Crítico</p>
              <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <AlertTriangle size={16} className="text-red-400" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-black tracking-tight mb-1 text-red-400">{lowStockCount}</p>
              <p className="text-xs text-slate-400 font-medium bg-slate-950/50 p-2 rounded-lg inline-block">Ítems con 10 o menos unidades</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col w-full mb-6">
        
        {/* Tabs & Toolbar */}
        <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex gap-6 px-4">
            <button 
              onClick={() => setActiveTab('all')}
              className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'all' ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
            >
              Todos los Productos
            </button>
            <button 
              onClick={() => setActiveTab('low_stock')}
              className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'low_stock' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
            >
              Stock Crítico
              {lowStockCount > 0 && (
                <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 py-0.5 px-2 rounded-full text-xs">
                  {lowStockCount}
                </span>
              )}
            </button>
          </div>
          
          <div className="p-4 flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-colors dark:text-white"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none sm:min-w-[200px]" ref={categoryDropdownRef}>
                  <div 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium flex justify-between items-center cursor-pointer dark:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Package size={16} className="text-slate-400" />
                      <span className="truncate">{selectedCategory === 'all' ? 'Todas las Categorías' : getCategoryById(selectedCategory)?.name || selectedCategory}</span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isCategoryDropdownOpen && (
                    <div className="absolute top-full right-0 left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar animate-fadeIn">
                      {categories.map(cat => (
                        <div 
                          key={cat}
                          className={`px-4 py-3 text-sm font-medium cursor-pointer transition-colors flex items-center justify-between
                            ${selectedCategory === cat 
                              ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white' 
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }
                          `}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsCategoryDropdownOpen(false);
                          }}
                        >
                          <span className="truncate">{cat === 'all' ? 'Todas las Categorías' : getCategoryById(cat)?.name || cat}</span>
                          {selectedCategory === cat && <Check size={14} className="text-emerald-500 shrink-0 ml-2" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shrink-0">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
                <button className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm shrink-0">
                  <Filter size={16} />
                  <span className="hidden md:inline">Filtros</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Container */}
        <div className="w-full p-4 bg-slate-50/50 dark:bg-slate-950/50 rounded-b-3xl">
          <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "flex flex-col gap-4"}>
            {filteredProducts.map(product => {
              const cat = getCategoryById(product.category[0]);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryData={cat}
                  viewMode={viewMode}
                  onEdit={() => console.log('Edit')}
                  onDelete={() => console.log('Delete')}
                  className="dark:bg-slate-900 dark:border-slate-800"
                >
                  {/* Custom Catalog Content */}
                  <div className={`pt-3 border-t border-slate-100 dark:border-slate-800 flex ${viewMode === 'list' ? 'flex-row items-center gap-4 ml-auto pl-4' : 'flex-col gap-2'}`}>
                    <div className={`flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50 group/input focus-within:border-slate-300 dark:focus-within:border-slate-600 transition-colors ${viewMode === 'list' ? 'w-32' : ''}`}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Costo $</span>
                      <input 
                        type="number"
                        value={product.purchasePrice || ''}
                        onChange={(e) => handleInlinePriceChange(product.id, 'purchasePrice', e.target.value)}
                        className="w-full bg-transparent text-right text-sm font-bold text-slate-700 dark:text-slate-300 outline-none ml-2"
                        placeholder="0"
                      />
                    </div>
                    <div className={`flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/20 group/input focus-within:border-emerald-300 dark:focus-within:border-emerald-700 transition-colors ${viewMode === 'list' ? 'w-32' : ''}`}>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase shrink-0">Venta $</span>
                      <input 
                        type="number"
                        value={product.price || ''}
                        onChange={(e) => handleInlinePriceChange(product.id, 'price', e.target.value)}
                        className="w-full bg-transparent text-right text-sm font-black text-emerald-700 dark:text-emerald-400 outline-none ml-2"
                        placeholder="0"
                      />
                    </div>
                    <div className={`flex justify-between items-center px-1 ${viewMode === 'list' ? 'w-24 ml-2' : 'mt-1'}`}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Stock</span>
                      <span className={`text-[11px] font-black px-2 py-1 rounded-lg ${product.stock > 50 ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' : product.stock > 10 ? 'text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' : 'text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {product.stock} u.
                      </span>
                    </div>
                  </div>
                </ProductCard>
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

      {/* AI Import Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Importación Inteligente</h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Escanea y digitaliza en segundos</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {aiStep === 'intro' && (
                <div className="text-center animate-fadeIn h-full flex flex-col items-center justify-center">
                  <div className="w-32 h-32 mx-auto bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-75"></div>
                    <Camera size={48} className="text-indigo-500 relative z-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Sube una foto de tu lista</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                    Nuestra Inteligencia Artificial leerá tus productos, precios y asignará categorías con imágenes automáticamente.
                  </p>
                  
                  <div className="w-full max-w-lg border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 rounded-3xl p-10 bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer group" onClick={() => {
                    setAiStep('scanning');
                    setTimeout(() => setAiStep('review'), 3000);
                  }}>
                    <Upload size={40} className="mx-auto text-indigo-400 mb-4 group-hover:-translate-y-2 transition-transform" />
                    <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">Haz clic aquí para subir o tomar foto</p>
                    <p className="text-sm text-indigo-400/70 mt-2">Soporta JPG, PNG o PDF</p>
                  </div>
                </div>
              )}

              {aiStep === 'scanning' && (
                <div className="text-center py-20 animate-fadeIn h-full flex flex-col items-center justify-center">
                  <Loader2 size={64} className="mx-auto text-indigo-500 animate-spin mb-8" />
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Analizando imagen...</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Extrayendo productos, precios y buscando imágenes de catálogo.</p>
                  
                  {/* Fake progress lines */}
                  <div className="mt-10 w-full max-w-md mx-auto space-y-4 text-left">
                    <div className="h-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-full animate-pulse"></div>
                    </div>
                    <p className="text-sm font-bold text-indigo-400 text-center">Detectando texto: "Coca Cola 2.25L - $2500"...</p>
                  </div>
                </div>
              )}

              {aiStep === 'review' && (
                <div className="animate-fadeIn h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                      <Check size={20} />
                      <span className="font-bold">¡Encontramos {scannedItems.length} productos!</span>
                    </div>
                    <button 
                      onClick={toggleAllScannedItems}
                      className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2"
                    >
                      {scannedItems.every(i => i.selected) ? 'Desmarcar todos' : 'Seleccionar todos'}
                    </button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex-1">
                    <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr] gap-4 p-4 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100/50 dark:bg-slate-800/50 hidden md:grid">
                      <div className="w-6"></div>
                      <div>Producto y Categoría</div>
                      <div className="text-right">Costo</div>
                      <div className="text-right">Venta</div>
                      <div className="text-center">Estado</div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {scannedItems.map((item) => (
                        <div 
                          key={item.id} 
                          className={`p-4 transition-colors flex flex-col md:grid md:grid-cols-[auto_2fr_1fr_1fr_1fr] md:items-center gap-4 ${item.selected ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950 opacity-60 grayscale'}`}
                        >
                          <div className="flex items-center gap-3 md:gap-0">
                            <input 
                              type="checkbox" 
                              checked={item.selected}
                              onChange={() => toggleScannedItemSelection(item.id)}
                              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                            />
                            {/* Mobile Product Header */}
                            <div className="md:hidden flex-1 font-bold text-slate-900 dark:text-white">
                              {item.name}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1 w-full">
                            <input 
                              type="text" 
                              value={item.name}
                              onChange={(e) => handleScannedItemChange(item.id, 'name', e.target.value)}
                              disabled={!item.selected}
                              className="font-bold text-sm bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-slate-900 dark:text-white w-full hidden md:block"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase md:hidden">Cat:</span>
                              <select
                                value={item.category}
                                onChange={(e) => handleScannedItemChange(item.id, 'category', e.target.value)}
                                disabled={!item.selected}
                                className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-transparent border-none outline-none cursor-pointer p-0"
                              >
                                {categories.filter(c => c !== 'all').map(cat => (
                                  <option key={cat} value={cat}>{getCategoryById(cat)?.name || cat}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex justify-between md:justify-end items-center gap-2 group/input w-full">
                            <span className="text-[10px] font-bold text-slate-400 uppercase md:hidden">Costo $</span>
                            <div className="relative w-24 md:w-auto">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                              <input 
                                type="number" 
                                value={item.purchasePrice}
                                onChange={(e) => handleScannedItemChange(item.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                                disabled={!item.selected}
                                className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg pl-5 pr-2 py-1.5 text-right text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between md:justify-end items-center gap-2 group/input w-full">
                            <span className="text-[10px] font-bold text-slate-400 uppercase md:hidden">Venta $</span>
                            <div className="relative w-24 md:w-auto">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-500 text-xs">$</span>
                              <input 
                                type="number" 
                                value={item.price}
                                onChange={(e) => handleScannedItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                                disabled={!item.selected}
                                className="w-full bg-emerald-50 dark:bg-emerald-900/20 rounded-lg pl-5 pr-2 py-1.5 text-right text-sm font-black text-emerald-700 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between md:justify-center items-center w-full mt-2 md:mt-0 pt-2 md:pt-0 border-t border-slate-100 dark:border-slate-800 md:border-t-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase md:hidden">Estado</span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.selected ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'}`}>
                              {item.selected ? 'Pendiente' : 'Ignorado'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
            
            {/* Action Footer for Review Step */}
            {aiStep === 'review' && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <button 
                  onClick={() => {
                    setIsAiModalOpen(false);
                    // Normally would add to products array here
                  }}
                  className="w-full py-4 rounded-xl font-black text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} />
                  Guardar {scannedItems.filter(i => i.selected).length} Productos en Catálogo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Añadir Nuevo Producto</h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Completa los datos para ingresar al catálogo</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Nombre del Producto</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Coca Cola 500ml"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Costo (Precio de Compra)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={newProduct.purchasePrice}
                      onChange={(e) => setNewProduct({...newProduct, purchasePrice: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm font-black outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Precio de Venta</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl pl-8 pr-4 py-3 text-sm font-black text-emerald-700 dark:text-emerald-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Stock Inicial</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Categoría</label>
                  <button 
                    onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {isCreatingCategory ? 'Usar categoría existente' : '+ Crear nueva categoría'}
                  </button>
                </div>

                {isCreatingCategory ? (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Nombre de la Categoría</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Fiambrería"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 transition-all dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative" ref={catColorRef}>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Color (Pastel)</label>
                        <div 
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium flex justify-between items-center cursor-pointer dark:text-white"
                          onClick={() => setIsCatColorDropdownOpen(!isCatColorDropdownOpen)}
                        >
                          <span className="capitalize">{newCategory.color}</span>
                          <ChevronDown size={14} className="text-slate-400" />
                        </div>
                        {isCatColorDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                            {['blue', 'red', 'emerald', 'yellow', 'purple', 'orange', 'pink'].map(color => (
                              <div 
                                key={color}
                                className="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 capitalize dark:text-white"
                                onClick={() => {
                                  setNewCategory({...newCategory, color});
                                  setIsCatColorDropdownOpen(false);
                                }}
                              >
                                {color}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative" ref={catIconRef}>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Ícono</label>
                        <div 
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium flex justify-between items-center cursor-pointer dark:text-white"
                          onClick={() => setIsCatIconDropdownOpen(!isCatIconDropdownOpen)}
                        >
                          <span>{newCategory.icon}</span>
                          <ChevronDown size={14} className="text-slate-400" />
                        </div>
                        {isCatIconDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                            {['Package', 'Wine', 'Coffee', 'Apple', 'ShoppingBag'].map(icon => (
                              <div 
                                key={icon}
                                className="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white"
                                onClick={() => {
                                  setNewCategory({...newCategory, icon});
                                  setIsCatIconDropdownOpen(false);
                                }}
                              >
                                {icon}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative" ref={productCatRef}>
                    <div 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium flex justify-between items-center cursor-pointer dark:text-white"
                      onClick={() => setIsProductCatDropdownOpen(!isProductCatDropdownOpen)}
                    >
                      <span>{getCategoryById(newProduct.category)?.name || newProduct.category}</span>
                      <ChevronDown size={16} className="text-slate-400" />
                    </div>
                    {isProductCatDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                        {categories.filter(c => c !== 'all').map(cat => (
                          <div 
                            key={cat}
                            className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 last:border-0"
                            onClick={() => {
                              setNewProduct({...newProduct, category: cat});
                              setIsProductCatDropdownOpen(false);
                            }}
                          >
                            {getCategoryById(cat)?.name || cat}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Imagen del Producto (Opcional)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <Package size={24} />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="URL de la imagen (ej. https://.../imagen.png)"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({...newProduct, image: e.target.value, useIcon: !e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-900 transition-all dark:text-white mb-2"
                    />
                    <p className="text-[10px] font-bold text-slate-400">Si dejas este campo vacío, se usará el ícono y color de la categoría seleccionada automáticamente.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  console.log("Saving...", newProduct, isCreatingCategory ? newCategory : null);
                  setIsAddModalOpen(false);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                Guardar Producto
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;