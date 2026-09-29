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
  const [activeTab, setActiveTab] = useState('categories');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('product');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imageInputType, setImageInputType] = useState('search');
  const [imageUrl, setImageUrl] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
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

  const templates = [
    { id: 'kiosco', name: 'Kiosco', icon: Store, productCount: 15, color: 'text-blue-600 bg-blue-50' },
    { id: 'ferreteria', name: 'Ferretería', icon: Hammer, productCount: 15, color: 'text-slate-600 bg-slate-50' },
    { id: 'carniceria', name: 'Carnicería', icon: Beef, productCount: 10, color: 'text-red-600 bg-red-50' },
  ];

  const [products, setProducts] = useState([
    { id: 1, name: 'Coca Cola 500ml', price: 1200, category: ['gaseosas'], templates: ['kiosco'], stock: 100, image: null, useIcon: true },
    { id: 2, name: 'Cerveza Quilmes 1L', price: 2500, category: ['cervezas'], templates: ['kiosco'], stock: 80, image: null, useIcon: true },
    { id: 3, name: 'Agua Mineral 2L', price: 800, category: ['aguas'], templates: ['kiosco'], stock: 150, image: null, useIcon: true },
    { id: 4, name: 'Jugo Naranja 1L', price: 1500, category: ['jugos'], templates: ['kiosco'], stock: 60, image: null, useIcon: true },
    { id: 5, name: 'Energizante Red Bull', price: 2200, category: ['energizantes'], templates: ['kiosco'], stock: 45, image: null, useIcon: true },
    { id: 6, name: 'Alfajor Jorgito', price: 800, category: ['alfajores'], templates: ['kiosco'], stock: 90, image: null, useIcon: true },
    { id: 7, name: 'Chocolate Milka', price: 2200, category: ['chocolates'], templates: ['kiosco'], stock: 65, image: null, useIcon: true },
    { id: 8, name: 'Galletitas Oreo', price: 1600, category: ['galletitas'], templates: ['kiosco'], stock: 75, image: null, useIcon: true },
    { id: 9, name: 'Papas Fritas Lays', price: 1400, category: ['papas-fritas'], templates: ['kiosco'], stock: 85, image: null, useIcon: true },
    { id: 10, name: 'Caramelos Sugus', price: 600, category: ['caramelos'], templates: ['kiosco'], stock: 120, image: null, useIcon: true },
    { id: 11, name: 'Cigarrillos Marlboro', price: 3500, category: ['cigarrillos'], templates: ['kiosco'], stock: 100, image: null, useIcon: true },
    { id: 12, name: 'Diario Clarín', price: 800, category: ['diarios-revistas'], templates: ['kiosco'], stock: 30, image: null, useIcon: true },
    { id: 13, name: 'Pilas AA Duracell x4', price: 1800, category: ['pilas-baterias'], templates: ['kiosco'], stock: 50, image: null, useIcon: true },
    { id: 14, name: 'Encendedor Bic', price: 400, category: ['articulos-libreria'], templates: ['kiosco'], stock: 80, image: null, useIcon: true },
    { id: 15, name: 'Helado Palito', price: 1200, category: ['helados'], templates: ['kiosco'], stock: 40, image: null, useIcon: true },
    { id: 16, name: 'Asado x Kg', price: 5500, category: ['carnes-rojas'], templates: ['carniceria'], stock: 25, image: null, useIcon: true },
    { id: 17, name: 'Vacío x Kg', price: 6200, category: ['carnes-rojas'], templates: ['carniceria'], stock: 20, image: null, useIcon: true },
    { id: 18, name: 'Picada x Kg', price: 4800, category: ['carnes-rojas'], templates: ['carniceria'], stock: 30, image: null, useIcon: true },
    { id: 19, name: 'Costilla x Kg', price: 4500, category: ['carnes-rojas'], templates: ['carniceria'], stock: 28, image: null, useIcon: true },
    { id: 20, name: 'Pollo Entero x Kg', price: 2800, category: ['pollo'], templates: ['carniceria'], stock: 35, image: null, useIcon: true },
    { id: 21, name: 'Pechuga x Kg', price: 3500, category: ['pollo'], templates: ['carniceria'], stock: 30, image: null, useIcon: true },
    { id: 22, name: 'Alitas x Kg', price: 2200, category: ['pollo'], templates: ['carniceria'], stock: 40, image: null, useIcon: true },
    { id: 23, name: 'Papa x Kg', price: 800, category: ['verduras'], templates: ['carniceria'], stock: 100, image: null, useIcon: true },
    { id: 24, name: 'Cebolla x Kg', price: 600, category: ['verduras'], templates: ['carniceria'], stock: 80, image: null, useIcon: true },
    { id: 25, name: 'Tomate x Kg', price: 1200, category: ['verduras'], templates: ['carniceria'], stock: 60, image: null, useIcon: true },
    { id: 26, name: 'Tornillos Autoperforantes x100', price: 2500, category: ['tornillos-clavos'], templates: ['ferreteria'], stock: 50, image: null, useIcon: true },
    { id: 27, name: 'Clavos 2" x Kg', price: 1800, category: ['tornillos-clavos'], templates: ['ferreteria'], stock: 60, image: null, useIcon: true },
    { id: 28, name: 'Tarugos Plásticos x50', price: 1200, category: ['tornillos-clavos'], templates: ['ferreteria'], stock: 70, image: null, useIcon: true },
    { id: 29, name: 'Tuercas y Arandelas Set', price: 1500, category: ['tornillos-clavos'], templates: ['ferreteria'], stock: 45, image: null, useIcon: true },
    { id: 30, name: 'Martillo Carpintero', price: 12500, category: ['herramientas'], templates: ['ferreteria'], stock: 15, image: null, useIcon: true },
    { id: 31, name: 'Destornillador Set x6', price: 8500, category: ['herramientas'], templates: ['ferreteria'], stock: 20, image: null, useIcon: true },
    { id: 32, name: 'Alicate Universal 8"', price: 9800, category: ['herramientas'], templates: ['ferreteria'], stock: 18, image: null, useIcon: true },
    { id: 33, name: 'Llave Inglesa 12"', price: 15500, category: ['herramientas'], templates: ['ferreteria'], stock: 12, image: null, useIcon: true },
    { id: 34, name: 'Sierra Manual', price: 7500, category: ['herramientas'], templates: ['ferreteria'], stock: 10, image: null, useIcon: true },
    { id: 35, name: 'Pintura Látex Blanca 4L', price: 18500, category: ['pinturas'], templates: ['ferreteria'], stock: 25, image: null, useIcon: true },
    { id: 36, name: 'Esmalte Sintético 1L', price: 12800, category: ['pinturas'], templates: ['ferreteria'], stock: 30, image: null, useIcon: true },
    { id: 37, name: 'Rodillo + Bandeja', price: 3500, category: ['pinturas'], templates: ['ferreteria'], stock: 40, image: null, useIcon: true },
    { id: 38, name: 'Pincel Set x3', price: 2200, category: ['pinturas'], templates: ['ferreteria'], stock: 50, image: null, useIcon: true },
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
    <div className="p-4 md:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-lg font-display font-bold text-slate-900 dark:text-white">Catálogo Maestro</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {activeTab === 'categories' ? 'Categorías de productos' : 
             activeTab === 'templates' ? 'Plantillas de negocio' : 
             'Productos organizados por categorías'}
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          <button 
            onClick={() => { setActiveTab('categories'); setSelectedTemplate(null); }}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${activeTab === 'categories' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Categorías
          </button>
          <button 
            onClick={() => { setActiveTab('templates'); setSelectedTemplate(null); }}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${activeTab === 'templates' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Plantillas
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${activeTab === 'products' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Productos
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex gap-3 justify-between items-center bg-slate-50/50 dark:bg-slate-950/30 shrink-0">
          <div className="flex-1 max-w-xs relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder={activeTab === 'categories' ? "Buscar categoría..." : activeTab === 'templates' ? "Buscar plantilla..." : "Buscar producto..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all dark:text-white"
            />
          </div>
          <div className="flex gap-2 items-center">
            {activeTab === 'products' && (
              <>
                <div className="flex bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    title="Cuadrícula"
                  >
                    <Grid size={13} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    title="Lista"
                  >
                    <List size={13} />
                  </button>
                </div>
                <div className="relative">
                  <select 
                    className="pl-2.5 pr-7 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-medium text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                    onChange={(e) => setSelectedTemplate(templates.find(t => t.id === e.target.value) || null)}
                    value={selectedTemplate?.id || ''}
                  >
                    <option value="">Todas</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                </div>
                <button 
                  onClick={() => openModal('product')}
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus size={13} />
                  Nuevo
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30">
          
          {activeTab === 'categories' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
              {getAllCategories().filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase())).map((category) => {
                const Icon = category.icon;
                return (
                  <div 
                    key={category.id}
                    className="group bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex flex-col items-center text-center relative"
                  >
                    <div className={`w-9 h-9 mb-1.5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${category.color} dark:opacity-90`}>
                      <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-[10px] leading-tight line-clamp-2 min-h-[24px]">{category.name}</h3>
                    {category.parentName && (
                      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded mt-0.5">{category.parentName}</span>
                    )}
                    <div className="absolute top-1.5 right-1.5">
                      {category.isParent ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="Principal"></div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" title="Subcategoría"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((template) => {
                const Icon = template.icon;
                return (
                  <div 
                    key={template.id}
                    onClick={() => { setSelectedTemplate(template); setActiveTab('products'); }}
                    className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer relative hover:-translate-y-0.5 overflow-hidden"
                  >
                    <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-10 group-hover:scale-150 transition-transform ${template.color}`}></div>
                    <div className="flex items-center gap-3 relative">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${template.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs">{template.name}</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{template.productCount} productos</p>
                      </div>
                      <ArrowLeft size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity -rotate-45" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'products' && (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" 
              : "space-y-2"
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
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-10 text-slate-400">
                  <Package size={28} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium">No se encontraron productos</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-zoom-in border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nuevo Producto</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Imagen</label>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                  {[
                    { id: 'search', icon: Search, label: 'Buscar' },
                    { id: 'url', icon: LinkIcon, label: 'URL' },
                    { id: 'icon', icon: Package, label: 'Ícono' },
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => { setImageInputType(opt.id); if (opt.id === 'icon') setSelectedImage(null); }}
                      className={`flex-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${imageInputType === opt.id ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      <opt.icon size={11} /> {opt.label}
                    </button>
                  ))}
                </div>

                {imageInputType === 'icon' ? (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                    <div className="w-10 h-10 mx-auto bg-indigo-100 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center mb-1">
                      <Package size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-[10px] text-slate-500">Se usará el ícono de la categoría</p>
                  </div>
                ) : selectedImage ? (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden group">
                    <img src={selectedImage} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setSelectedImage(null)} className="absolute top-1.5 right-1.5 p-1 bg-white dark:bg-slate-800 rounded-full text-slate-500 hover:text-red-500 shadow-sm">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {imageInputType === 'search' ? (
                      <>
                        <div className="flex gap-1.5">
                          <input type="text" placeholder="Buscar imagen..." 
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 dark:text-white"
                            value={imageSearchQuery}
                            onChange={(e) => setImageSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchImages(imageSearchQuery)}
                          />
                          <button onClick={() => searchImages(imageSearchQuery)} disabled={loadingImages || !imageSearchQuery}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                          >
                            {loadingImages ? '...' : 'Buscar'}
                          </button>
                        </div>
                        {images.length > 0 && (
                          <div className="grid grid-cols-5 gap-1.5 max-h-24 overflow-y-auto custom-scrollbar p-1 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950">
                            {images.map((img, idx) => (
                              <button key={idx} onClick={() => setSelectedImage(img.link)}
                                className="aspect-square rounded overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:ring-1 ring-indigo-500/20 transition-all bg-white dark:bg-slate-900"
                              >
                                <img src={img.thumbnailLink} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <input type="url" placeholder="https://ejemplo.com/imagen.jpg"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 dark:text-white"
                        value={imageUrl}
                        onChange={(e) => { setImageUrl(e.target.value); setSelectedImage(e.target.value); }}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Nombre</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 dark:text-white" placeholder="Ej: Coca Cola 500ml" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Precio</label>
                  <input type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 dark:text-white" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Stock</label>
                  <input type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 dark:text-white" placeholder="0" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Categorías</label>
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {selectedCategories.map(catId => {
                      const cat = getCategoryById(catId);
                      if (!cat) return null;
                      const Icon = cat.icon;
                      return (
                        <span key={catId} className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 flex items-center gap-1">
                          <Icon size={9} />
                          {cat.name}
                          <button onClick={() => toggleCategory(catId)} className="hover:text-red-600 dark:hover:text-red-400 ml-0.5"><X size={9} /></button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input type="text" placeholder="Buscar categoría..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 dark:text-white"
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                  />
                </div>
                <div className="max-h-36 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950">
                  <div className="grid grid-cols-2 gap-1 p-1.5">
                    {filteredCategoriesForSelection.slice(0, 20).map(cat => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategories.includes(cat.id);
                      return (
                        <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                          className={`flex items-center gap-1.5 p-1.5 rounded-md text-left transition-all border ${isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-800'}`}
                        >
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${isSelected ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            <Icon size={12} className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'} />
                          </div>
                          <span className="text-[9px] font-bold truncate flex-1">{cat.name}</span>
                          {isSelected && <Check size={10} className="shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 justify-end bg-slate-50/50 dark:bg-slate-950/50">
              <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-[10px] transition-colors">Cancelar</button>
              <button className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all text-[10px] flex items-center gap-1.5 shadow-sm">
                <Save size={13} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
