import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Save, 
  X,
  ChevronDown,
  ArrowLeft,
  Store,
  Grid,
  List,
  Image as ImageIcon,
  Check,
  Upload,
  Link as LinkIcon,
  Hammer,
  Beef
} from 'lucide-react';
import useImageSearch from './hooks/useImageSearch';
import { productCategories, getAllCategories, getCategoryById } from './config/productCategories';
import ProductCard from '../../shared/components/ProductCard';

const AdminProducts = () => {
  // Views: 'templates' (rubros) or 'products' (specific list)
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'templates' | 'products'
  const [selectedTemplate, setSelectedTemplate] = useState(null); // For filter in products view
  const [searchTerm, setSearchTerm] = useState('');
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false); // Modal for image search
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('product'); // 'template' | 'product'
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imageInputType, setImageInputType] = useState('search'); // 'search' | 'url' | 'icon'
  const [imageUrl, setImageUrl] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  const { images, loading: loadingImages, search: searchImages, clear: clearImages } = useImageSearch();

  const openImageSearch = () => setIsImageSearchOpen(true);
  const closeImageSearch = () => {
    setIsImageSearchOpen(false);
    clearImages();
    setImageSearchQuery('');
  };

  const handleSelectImage = (link) => {
    setSelectedImage(link);
    closeImageSearch();
  };

  // Templates - Solo 3 tipos de negocio
  const templates = [
    { id: 'kiosco', name: 'Kiosco', icon: Store, productCount: 15, color: 'text-blue-600 bg-blue-50' },
    { id: 'ferreteria', name: 'Ferretería', icon: Hammer, productCount: 15, color: 'text-slate-600 bg-slate-50' },
    { id: 'carniceria', name: 'Carnicería', icon: Beef, productCount: 10, color: 'text-red-600 bg-red-50' },
  ];

  // Mock Products - Organizados por plantilla
  const [products, setProducts] = useState([
    // ========== KIOSCO ==========
    // Bebidas
    { id: 1, name: 'Coca Cola 500ml', price: 1200, category: ['gaseosas'], templates: ['kiosco'], stock: 100, image: null, useIcon: true },
    { id: 2, name: 'Cerveza Quilmes 1L', price: 2500, category: ['cervezas'], templates: ['kiosco'], stock: 80, image: null, useIcon: true },
    { id: 3, name: 'Agua Mineral 2L', price: 800, category: ['aguas'], templates: ['kiosco'], stock: 150, image: null, useIcon: true },
    { id: 4, name: 'Jugo Naranja 1L', price: 1500, category: ['jugos'], templates: ['kiosco'], stock: 60, image: null, useIcon: true },
    { id: 5, name: 'Energizante Red Bull', price: 2200, category: ['energizantes'], templates: ['kiosco'], stock: 45, image: null, useIcon: true },
    
    // Golosinas y Snacks
    { id: 6, name: 'Alfajor Jorgito', price: 800, category: ['alfajores'], templates: ['kiosco'], stock: 90, image: null, useIcon: true },
    { id: 7, name: 'Chocolate Milka', price: 2200, category: ['chocolates'], templates: ['kiosco'], stock: 65, image: null, useIcon: true },
    { id: 8, name: 'Galletitas Oreo', price: 1600, category: ['galletitas'], templates: ['kiosco'], stock: 75, image: null, useIcon: true },
    { id: 9, name: 'Papas Fritas Lays', price: 1400, category: ['papas-fritas'], templates: ['kiosco'], stock: 85, image: null, useIcon: true },
    { id: 10, name: 'Caramelos Sugus', price: 600, category: ['caramelos'], templates: ['kiosco'], stock: 120, image: null, useIcon: true },
    
    // Kiosco varios
    { id: 11, name: 'Cigarrillos Marlboro', price: 3500, category: ['cigarrillos'], templates: ['kiosco'], stock: 100, image: null, useIcon: true },
    { id: 12, name: 'Diario Clarín', price: 800, category: ['diarios-revistas'], templates: ['kiosco'], stock: 30, image: null, useIcon: true },
    { id: 13, name: 'Pilas AA Duracell x4', price: 1800, category: ['pilas-baterias'], templates: ['kiosco'], stock: 50, image: null, useIcon: true },
    { id: 14, name: 'Encendedor Bic', price: 400, category: ['articulos-libreria'], templates: ['kiosco'], stock: 80, image: null, useIcon: true },
    { id: 15, name: 'Helado Palito', price: 1200, category: ['helados'], templates: ['kiosco'], stock: 40, image: null, useIcon: true },
    
    // ========== CARNICERÍA ==========
    // Carnes
    { id: 16, name: 'Asado x Kg', price: 5500, category: ['carnes-rojas'], templates: ['carniceria'], stock: 25, image: null, useIcon: true },
    { id: 17, name: 'Vacío x Kg', price: 6200, category: ['carnes-rojas'], templates: ['carniceria'], stock: 20, image: null, useIcon: true },
    { id: 18, name: 'Picada x Kg', price: 4800, category: ['carnes-rojas'], templates: ['carniceria'], stock: 30, image: null, useIcon: true },
    { id: 19, name: 'Costilla x Kg', price: 4500, category: ['carnes-rojas'], templates: ['carniceria'], stock: 28, image: null, useIcon: true },
    
    // Pollos
    { id: 20, name: 'Pollo Entero x Kg', price: 2800, category: ['pollo'], templates: ['carniceria'], stock: 35, image: null, useIcon: true },
    { id: 21, name: 'Pechuga x Kg', price: 3500, category: ['pollo'], templates: ['carniceria'], stock: 30, image: null, useIcon: true },
    { id: 22, name: 'Alitas x Kg', price: 2200, category: ['pollo'], templates: ['carniceria'], stock: 40, image: null, useIcon: true },
    
    // Verduras y Papas
    { id: 23, name: 'Papa x Kg', price: 800, category: ['verduras'], templates: ['carniceria'], stock: 100, image: null, useIcon: true },
    { id: 24, name: 'Cebolla x Kg', price: 600, category: ['verduras'], templates: ['carniceria'], stock: 80, image: null, useIcon: true },
    { id: 25, name: 'Tomate x Kg', price: 1200, category: ['verduras'], templates: ['carniceria'], stock: 60, image: null, useIcon: true },
    
    // ========== FERRETERÍA ==========
    // Tornillos y Clavos
    { id: 26, name: 'Tornillos Autoperforantes x100', price: 2500, category: ['tornillos-clavos'], templates: ['ferreteria'], stock: 50, image: null, useIcon: true },
    { id: 27, name: 'Clavos 2" x Kg', price: 1800, category: ['tornillos-clavos'], templates: ['ferreteria'], stock: 60, image: null, useIcon: true },
    { id: 28, name: 'Tarugos Plásticos x50', price: 1200, category: ['tornillos-clavos'], templates: ['ferreteria'], stock: 70, image: null, useIcon: true },
    { id: 29, name: 'Tuercas y Arandelas Set', price: 1500, category: ['tornillos-clavos'], templates: ['ferreteria'], stock: 45, image: null, useIcon: true },
    
    // Herramientas
    { id: 30, name: 'Martillo Carpintero', price: 12500, category: ['herramientas'], templates: ['ferreteria'], stock: 15, image: null, useIcon: true },
    { id: 31, name: 'Destornillador Set x6', price: 8500, category: ['herramientas'], templates: ['ferreteria'], stock: 20, image: null, useIcon: true },
    { id: 32, name: 'Alicate Universal 8"', price: 9800, category: ['herramientas'], templates: ['ferreteria'], stock: 18, image: null, useIcon: true },
    { id: 33, name: 'Llave Inglesa 12"', price: 15500, category: ['herramientas'], templates: ['ferreteria'], stock: 12, image: null, useIcon: true },
    { id: 34, name: 'Sierra Manual', price: 7500, category: ['herramientas'], templates: ['ferreteria'], stock: 10, image: null, useIcon: true },
    
    // Pinturas
    { id: 35, name: 'Pintura Látex Blanca 4L', price: 18500, category: ['pinturas'], templates: ['ferreteria'], stock: 25, image: null, useIcon: true },
    { id: 36, name: 'Esmalte Sintético 1L', price: 12800, category: ['pinturas'], templates: ['ferreteria'], stock: 30, image: null, useIcon: true },
    { id: 37, name: 'Rodillo + Bandeja', price: 3500, category: ['pinturas'], templates: ['ferreteria'], stock: 40, image: null, useIcon: true },
    { id: 38, name: 'Pincel Set x3', price: 2200, category: ['pinturas'], templates: ['ferreteria'], stock: 50, image: null, useIcon: true },
    
    // Electricidad
    { id: 39, name: 'Cable 2x1.5mm x10m', price: 5500, category: ['electricidad'], templates: ['ferreteria'], stock: 35, image: null, useIcon: true },
    { id: 40, name: 'Enchufe 3 Patas', price: 1200, category: ['electricidad'], templates: ['ferreteria'], stock: 60, image: null, useIcon: true },
  ]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTemplate = selectedTemplate ? product.templates?.includes(selectedTemplate.id) : true;
    return matchesSearch && matchesTemplate;
  });

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    setSelectedCategories([]);
    setSelectedImage(null);
    setImageUrl('');
    setImageInputType('search');
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategoriesForSelection = getAllCategories().filter(cat => 
    cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-1">Catálogo Maestro</h1>
          <p className="text-sm text-slate-500">
            {activeTab === 'categories' ? 'Categorías de productos (Lácteos, Bebidas, etc.)' : 
             activeTab === 'templates' ? 'Plantillas de negocio (Kiosco, Carnicería, etc.)' : 
             'Productos organizados por categorías'}
          </p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => { setActiveTab('categories'); setSelectedTemplate(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Categorías
          </button>
          <button 
            onClick={() => { setActiveTab('templates'); setSelectedTemplate(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'templates' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Plantillas
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Productos
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-3 justify-between items-center bg-slate-50/50">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={activeTab === 'categories' ? "Buscar categoría..." : activeTab === 'templates' ? "Buscar plantilla de negocio..." : "Buscar producto..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            {activeTab === 'products' && (
              <>
                {/* View Mode Toggle */}
                <div className="flex bg-white border border-slate-200 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Vista en cuadrícula"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Vista en lista"
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* Template Filter */}
                <div className="relative">
                  <select 
                    className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                    onChange={(e) => setSelectedTemplate(templates.find(t => t.id === e.target.value) || null)}
                    value={selectedTemplate?.id || ''}
                  >
                    <option value="">Todas las plantillas</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
                
                <button 
                  onClick={() => openModal('product')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Nuevo Producto
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
          
          {/* CATEGORIES GRID */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {getAllCategories().filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase())).map((category) => {
                const Icon = category.icon;
                return (
                  <div 
                    key={category.id}
                    className="group bg-white rounded-xl border-2 border-slate-200 p-4 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 cursor-pointer flex flex-col items-center text-center relative hover:-translate-y-1"
                  >
                    {/* Icon */}
                    <div className={`w-14 h-14 mb-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md ${category.color}`}>
                      <Icon size={28} strokeWidth={2} />
                    </div>
                    
                    {/* Name */}
                    <h3 className="font-bold text-slate-900 text-xs mb-1 line-clamp-2 min-h-[32px]">{category.name}</h3>
                    
                    {/* Parent category if exists */}
                    {category.parentName && (
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                        {category.parentName}
                      </span>
                    )}
                    
                    {/* Type badge */}
                    <div className="absolute top-2 right-2">
                      {category.isParent ? (
                        <div className="w-2 h-2 rounded-full bg-indigo-500" title="Categoría principal"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-300" title="Subcategoría"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* TEMPLATES GRID */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((template) => {
                const Icon = template.icon;
                const subcategoryCount = template.subcategories?.length || 0;
                return (
                  <div 
                    key={template.id}
                    onClick={() => { setSelectedTemplate(template); setActiveTab('products'); }}
                    className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 p-5 hover:shadow-xl hover:border-indigo-300 hover:from-indigo-50 hover:to-white transition-all duration-300 cursor-pointer flex flex-col relative hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Background decoration */}
                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-all group-hover:scale-150 ${template.color}`}></div>
                    
                    {/* Icon */}
                    <div className={`relative w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-md ${template.color}`}>
                      <Icon size={32} strokeWidth={2} />
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-700 transition-colors">{template.name}</h3>
                      <p className="text-xs text-slate-500 mb-3">{subcategoryCount} categorías</p>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-lg px-2 py-1.5 group-hover:bg-indigo-100 transition-colors">
                          <p className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600">PRODUCTOS</p>
                          <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">{template.productCount || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PRODUCTS GRID/LIST */}
          {activeTab === 'products' && (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
              : "flex flex-col gap-3"
            }>
              {filteredProducts.map((product) => {
                const cat = getCategoryById(product.category[0]);
                
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryData={cat}
                    viewMode={viewMode}
                    onEdit={(p) => console.log('Editar', p)}
                    onDelete={(p) => handleDelete(p.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal - Product Form Only */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in border border-slate-100">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900">Nuevo Producto</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Product Form */}
              <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Imagen del Producto</label>
                    
                    {/* Image Type Selector */}
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                      <button
                        onClick={() => setImageInputType('search')}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${imageInputType === 'search' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <Search size={12} /> Buscar
                      </button>
                      <button
                        onClick={() => setImageInputType('url')}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${imageInputType === 'url' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <LinkIcon size={12} /> URL
                      </button>
                      <button
                        onClick={() => { setImageInputType('icon'); setSelectedImage(null); }}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${imageInputType === 'icon' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <Package size={12} /> Ícono
                      </button>
                    </div>

                    {/* Image Preview or Icon Indicator */}
                    {imageInputType === 'icon' ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <div className="w-12 h-12 mx-auto bg-indigo-100 rounded-xl flex items-center justify-center mb-2">
                          <Package size={24} className="text-indigo-600" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Se usará el ícono de la categoría</p>
                      </div>
                    ) : selectedImage ? (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden group">
                        <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setSelectedImage(null)}
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-slate-500 hover:text-red-500 shadow-sm"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {imageInputType === 'search' ? (
                          <>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Buscar imagen (ej: Coca Cola)..." 
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                value={imageSearchQuery}
                                onChange={(e) => setImageSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchImages(imageSearchQuery)}
                              />
                              <button 
                                onClick={() => searchImages(imageSearchQuery)}
                                disabled={loadingImages || !imageSearchQuery}
                                className="bg-indigo-600 text-white px-3 py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                              >
                                {loadingImages ? '...' : 'Buscar'}
                              </button>
                            </div>
                            
                            {images.length > 0 && (
                              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1 border border-slate-100 rounded-lg bg-slate-50">
                                {images.map((img, idx) => (
                                  <button 
                                    key={idx}
                                    onClick={() => setSelectedImage(img.link)}
                                    className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-500 hover:ring-2 ring-indigo-500/20 transition-all relative group bg-white"
                                  >
                                    <img src={img.thumbnailLink} alt="result" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                  </button>
                                ))}
                              </div>
                            )}
                            {imageSearchQuery && !loadingImages && images.length === 0 && (
                              <div className="text-xs text-slate-400 text-center py-2">
                                No se encontraron imágenes. Intenta otro término.
                              </div>
                            )}
                          </>
                        ) : (
                          <input 
                            type="url" 
                            placeholder="https://ejemplo.com/imagen.jpg" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            value={imageUrl}
                            onChange={(e) => { setImageUrl(e.target.value); setSelectedImage(e.target.value); }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all" placeholder="Ej: Coca Cola" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Precio</label>
                      <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all" placeholder="0.00" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Stock Base</label>
                      <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all" placeholder="0" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Categorías</label>
                    
                    {/* Selected Categories */}
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                        {selectedCategories.map(catId => {
                          const cat = getCategoryById(catId);
                          if (!cat) return null;
                          const Icon = cat.icon;
                          return (
                            <span key={catId} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                              <Icon size={10} />
                              {cat.name}
                              <button onClick={() => toggleCategory(catId)} className="hover:text-red-600">
                                <X size={10} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Category Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Buscar categoría..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-500"
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Category Grid */}
                    <div className="max-h-48 overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg bg-slate-50">
                      <div className="grid grid-cols-2 gap-1.5 p-2">
                        {filteredCategoriesForSelection.slice(0, 20).map(cat => {
                          const Icon = cat.icon;
                          const isSelected = selectedCategories.includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              onClick={() => toggleCategory(cat.id)}
                              className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                                isSelected 
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'bg-indigo-100' : 'bg-slate-100'
                              }`}>
                                <Icon size={14} className={isSelected ? 'text-indigo-600' : 'text-slate-500'} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold truncate">{cat.name}</p>
                                {cat.parentName && (
                                  <p className="text-[9px] text-slate-400 truncate">{cat.parentName}</p>
                                )}
                              </div>
                              {isSelected && (
                                <Check size={12} className="text-indigo-600 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {filteredCategoriesForSelection.length === 0 && (
                        <div className="text-xs text-slate-400 text-center py-4">
                          No se encontraron categorías
                        </div>
                      )}
                    </div>
                  </div>
                </>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50/50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg text-sm transition-colors">Cancelar</button>
              <button className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm">
                <Save size={16} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Dedicated Image Search Modal */}
      {isImageSearchOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-zoom-in flex flex-col h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-bold text-lg text-slate-900">Buscar Imagen</h3>
              <button onClick={closeImageSearch} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col overflow-hidden bg-slate-50">
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Escribe el nombre del producto (ej: Coca Cola 500ml)..." 
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                    value={imageSearchQuery}
                    onChange={(e) => setImageSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchImages(imageSearchQuery)}
                    autoFocus
                  />
                </div>
                <button 
                  onClick={() => searchImages(imageSearchQuery)}
                  disabled={loadingImages || !imageSearchQuery}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200"
                >
                  {loadingImages ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {/* Results Grid */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
                    {images.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSelectImage(img.link)}
                        className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-500 hover:ring-2 ring-indigo-500/20 transition-all flex flex-col h-full text-left"
                      >
                        <div className="aspect-square bg-white p-4 flex items-center justify-center relative">
                           <img src={img.thumbnailLink} alt={img.title} className="w-full h-full object-contain transition-transform group-hover:scale-105" />
                        </div>
                        <div className="p-3 border-t border-slate-100 bg-slate-50/50 group-hover:bg-white transition-colors">
                          <p className="text-xs font-bold text-slate-700 line-clamp-2 leading-tight group-hover:text-indigo-600">
                            {img.title}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                       {loadingImages ? <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div> : <ImageIcon size={40} className="opacity-50" />}
                    </div>
                    <p className="font-medium text-slate-500">
                      {loadingImages ? 'Buscando productos...' : 'Busca un producto para ver imágenes'}
                    </p>
                    {!loadingImages && (
                      <p className="text-sm max-w-xs text-center">
                        Prueba con nombres de marcas reales como "Oreo", "Colgate", "Bimbo".
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;