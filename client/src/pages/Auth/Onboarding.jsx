import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Store, Palette, Building2, Plus, Trash2, UserPlus, Sparkles, Users, ShoppingBag, Box, Layers, Moon, Sun, Mail, Phone, Lock, ShieldCheck, Grid, List, Package, X } from 'lucide-react';
import logo from '../../assets/images/landing/Gestly.png';
import CustomSelect from '../../shared/components/Select/CustomSelect';
import { getCategoryById } from '../Admin/config/productCategories';
import ProductCard from '../../shared/components/ProductCard';

// Import sector images
import almacenImg from '../../assets/images/sectors/Almacen.png';
import almacenKioscoImg from '../../assets/images/sectors/AlmacenKiosco.png';
import carniceriaImg from '../../assets/images/sectors/Carniceria.png';
import electronicaImg from '../../assets/images/sectors/Electronica.png';
import farmaciaImg from '../../assets/images/sectors/Farmacia.png';
import ferreteriaImg from '../../assets/images/sectors/Ferreteria.png';
import fiambreriaImg from '../../assets/images/sectors/Fiambreria.png';
import gastronomiaImg from '../../assets/images/sectors/Gastronomia.png';
import jugueteriaImg from '../../assets/images/sectors/Jugeteria.png';
import kioscoImg from '../../assets/images/sectors/Kiosco.png';
import libreriaImg from '../../assets/images/sectors/Libreria.png';
import panaderiaImg from '../../assets/images/sectors/Panaderia.png';
import polleriaImg from '../../assets/images/sectors/Polleria.png';
import ropaImg from '../../assets/images/sectors/Ropa.png';
import zapateriaImg from '../../assets/images/sectors/Zapateria.png';

const Onboarding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // State for form data
  const [data, setData] = useState({
    name: location.state?.name || 'User',
    rubro: '',
    stockType: 'simple',
    themeColor: 'blue',
    themeMode: 'light',
    branches: [{ id: 1, name: '' }],
    employees: [
      { id: 1, name: location.state?.name || 'User', role: 'Administrador', email: 'admin@gestly.com', phone: '', password: '', branchIds: [], isFixed: true }
    ],
    products: []
  });

  // Auto-select all products when rubro changes
  useEffect(() => {
    if (data.rubro && step === 5) {
      const templates = productTemplates[data.rubro] || [];
      if (data.products.length === 0) {
        // Select all products by default with price set but marked as needing review
        setData(prev => ({
          ...prev,
          products: templates.map(p => ({
            ...p,
            customPrice: p.price,
            stock: 0,
            isActive: true,
            needsPriceReview: true // Yellow warning flag
          }))
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.rubro, step]);

  const steps = [
    { key: 'welcome', icon: null },
    { key: 'business', icon: Store },
    { key: 'preferences', icon: Palette },
    { key: 'branches', icon: Building2 },
    { key: 'employees', icon: Users },
    { key: 'catalog', icon: ShoppingBag },
    { key: 'finish', icon: Check }
  ];

  // Solo 3 plantillas disponibles que coinciden con el catálogo de admin
  const rubros = [
    { name: 'Kiosco', image: kioscoImg, id: 'kiosco' },
    { name: 'Ferretería', image: ferreteriaImg, id: 'ferreteria' },
    { name: 'Carnicería', image: carniceriaImg, id: 'carniceria' }
  ];

  const pets = [
    'Perro', 'Gato', 'Hamster', 'Pez', 'Ave', 'Conejo', 'Tortuga', 'Otro'
  ];

  // Templates de productos por rubro - Coinciden con el catálogo de admin
  const productTemplates = {
    'Kiosco': [
      { name: 'Coca Cola 500ml', price: 1200, category: ['gaseosas'] },
      { name: 'Cerveza Quilmes 1L', price: 2500, category: ['cervezas'] },
      { name: 'Agua Mineral 2L', price: 800, category: ['aguas'] },
      { name: 'Jugo Naranja 1L', price: 1500, category: ['jugos'] },
      { name: 'Energizante Red Bull', price: 2200, category: ['energizantes'] },
      { name: 'Alfajor Jorgito', price: 800, category: ['alfajores'] },
      { name: 'Chocolate Milka', price: 2200, category: ['chocolates'] },
      { name: 'Galletitas Oreo', price: 1600, category: ['galletitas'] },
      { name: 'Papas Fritas Lays', price: 1400, category: ['papas-fritas'] },
      { name: 'Caramelos Sugus', price: 600, category: ['caramelos'] },
      { name: 'Cigarrillos Marlboro', price: 3500, category: ['cigarrillos'] },
      { name: 'Diario Clarín', price: 800, category: ['diarios-revistas'] },
      { name: 'Pilas AA Duracell x4', price: 1800, category: ['pilas-baterias'] },
      { name: 'Encendedor Bic', price: 400, category: ['articulos-libreria'] },
      { name: 'Helado Palito', price: 1200, category: ['helados'] }
    ],
    'Ferretería': [
      { name: 'Tornillos Autoperforantes x100', price: 2500, category: ['tornillos-clavos'] },
      { name: 'Clavos 2" x Kg', price: 1800, category: ['tornillos-clavos'] },
      { name: 'Tarugos Plásticos x50', price: 1200, category: ['tornillos-clavos'] },
      { name: 'Tuercas y Arandelas Set', price: 1500, category: ['tornillos-clavos'] },
      { name: 'Martillo Carpintero', price: 12500, category: ['herramientas'] },
      { name: 'Destornillador Set x6', price: 8500, category: ['herramientas'] },
      { name: 'Alicate Universal 8"', price: 9800, category: ['herramientas'] },
      { name: 'Llave Inglesa 12"', price: 15500, category: ['herramientas'] },
      { name: 'Sierra Manual', price: 7500, category: ['herramientas'] },
      { name: 'Pintura Látex Blanca 4L', price: 18500, category: ['pinturas'] },
      { name: 'Esmalte Sintético 1L', price: 12800, category: ['pinturas'] },
      { name: 'Rodillo + Bandeja', price: 3500, category: ['pinturas'] },
      { name: 'Pincel Set x3', price: 2200, category: ['pinturas'] },
      { name: 'Cable 2x1.5mm x10m', price: 5500, category: ['electricidad'] },
      { name: 'Enchufe 3 Patas', price: 1200, category: ['electricidad'] }
    ],
    'Carnicería': [
      { name: 'Asado x Kg', price: 5500, category: ['carnes-rojas'] },
      { name: 'Vacío x Kg', price: 6200, category: ['carnes-rojas'] },
      { name: 'Picada x Kg', price: 4800, category: ['carnes-rojas'] },
      { name: 'Costilla x Kg', price: 4500, category: ['carnes-rojas'] },
      { name: 'Pollo Entero x Kg', price: 2800, category: ['pollo'] },
      { name: 'Pechuga x Kg', price: 3500, category: ['pollo'] },
      { name: 'Alitas x Kg', price: 2200, category: ['pollo'] },
      { name: 'Papa x Kg', price: 800, category: ['verduras'] },
      { name: 'Cebolla x Kg', price: 600, category: ['verduras'] },
      { name: 'Tomate x Kg', price: 1200, category: ['verduras'] }
    ]
  };

  const handleNext = () => {
    // Validate catalog step before proceeding
    if (step === 5) {
      if (!validateCatalog()) {
        return;
      }
    }
    
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  // Branch Management
  const addBranch = () => {
    setData({
      ...data,
      branches: [...data.branches, { id: Date.now(), name: '', address: '' }]
    });
  };

  const removeBranch = (id) => {
    if (data.branches.length > 1) {
      // Remove branch
      const newBranches = data.branches.filter(b => b.id !== id);
      // Remove this branch from all employees
      const newEmployees = data.employees.map(e => ({
        ...e,
        branchIds: e.branchIds.filter(bid => bid !== id)
      }));
      
      setData({
        ...data,
        branches: newBranches,
        employees: newEmployees
      });
    }
  };

  const updateBranch = (id, field, value) => {
    setData({
      ...data,
      branches: data.branches.map(b => b.id === id ? { ...b, [field]: value } : b)
    });
  };

  // Employee Management
  const addEmployee = () => {
    setData({
      ...data,
      employees: [...data.employees, { id: Date.now(), name: '', role: 'Vendedor', email: '', phone: '', password: '', branchIds: [] }]
    });
  };

  const removeEmployee = (id) => {
    if (data.employees.length > 1) {
      setData({
        ...data,
        employees: data.employees.filter(e => e.id !== id)
      });
    }
  };

  const updateEmployee = (id, field, value) => {
    setData({
      ...data,
      employees: data.employees.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const toggleEmployeeBranch = (employeeId, branchId) => {
    setData({
      ...data,
      employees: data.employees.map(e => {
        if (e.id === employeeId) {
          const hasBranch = e.branchIds.includes(branchId);
          return {
            ...e,
            branchIds: hasBranch 
              ? e.branchIds.filter(id => id !== branchId)
              : [...e.branchIds, branchId]
          };
        }
        return e;
      })
    });
  };

  // Catalog Management
  const toggleProduct = (product) => {
    const exists = data.products.find(p => p.name === product.name);
    if (exists) {
      // Toggle isActive instead of removing
      setData({
        ...data,
        products: data.products.map(p => 
          p.name === product.name ? { ...p, isActive: !p.isActive } : p
        )
      });
    } else {
      // Add product with default values
      setData({
        ...data,
        products: [...data.products, { 
          ...product, 
          customPrice: product.price,
          stock: 0,
          isActive: true,
          needsPriceReview: true
        }]
      });
    }
  };

  const updateProductField = (productName, field, value) => {
    setData({
      ...data,
      products: data.products.map(p => {
        if (p.name === productName) {
          const updated = { ...p, [field]: value };
          // Remove yellow warning when price is changed
          if (field === 'customPrice' && value > 0) {
            updated.needsPriceReview = false;
          }
          return updated;
        }
        return p;
      })
    });
  };

  const toggleAllProducts = (templates) => {
    const allActive = data.products.every(p => p.isActive);
    if (allActive) {
      // Deactivate all
      setData({ 
        ...data, 
        products: data.products.map(p => ({ ...p, isActive: false }))
      });
    } else {
      // Activate all
      setData({ 
        ...data, 
        products: data.products.map(p => ({ ...p, isActive: true }))
      });
    }
  };

  const validateCatalog = () => {
    const selectedProducts = data.products.filter(p => p.isActive);
    const productsWithoutPrice = selectedProducts.filter(p => !p.customPrice || p.customPrice === 0 || p.needsPriceReview);
    
    if (productsWithoutPrice.length > 0) {
      alert(`⚠️ Tienes ${productsWithoutPrice.length} producto(s) que necesitan revisión de precio. Por favor, revisa y confirma el precio de todos los productos seleccionados.`);
      return false;
    }
    return true;
  };

  const getColorHex = (name) => {
    const colors = {
      blue: '#3b82f6',
      indigo: '#6366f1',
      violet: '#8b5cf6',
      emerald: '#10b981',
      rose: '#f43f5e',
      orange: '#f97316',
      slate: '#475569'
    };
    return colors[name] || '#ccc';
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <div className="text-center animate-fadeIn">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Sparkles size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">
              {t('auth.onboarding.welcome.title', { name: data.name })}
            </h2>
            <p className="text-xl text-slate-500 max-w-lg mx-auto mb-10">
              {t('auth.onboarding.welcome.subtitle')}
            </p>
            <button
              onClick={handleNext}
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              {t('auth.onboarding.welcome.start')}
            </button>
          </div>
        );

      case 1: // Business (Rubro & Stock)
        return (
          <div className="animate-fadeIn w-full max-w-6xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">{t('auth.onboarding.business.title')}</h2>
            <p className="text-slate-500 mb-8">{t('auth.onboarding.business.subtitle')}</p>
            
            <div className="space-y-12">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">{t('auth.onboarding.business.rubroLabel')}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {rubros.map((rubro) => (
                    <button
                      key={rubro.name}
                      onClick={() => handleChange('rubro', rubro.name)}
                      className={`group relative flex flex-col h-full rounded-3xl border transition-all duration-300 overflow-hidden text-left hover:shadow-xl hover:-translate-y-1 ${
                        data.rubro === rubro.name
                          ? 'border-indigo-600 bg-white shadow-lg ring-1 ring-indigo-500/20' 
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      {/* Image Header */}
                      <div className="h-32 w-full relative overflow-hidden bg-white">
                        <img 
                          src={rubro.image} 
                          alt={rubro.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                        {data.rubro === rubro.name && (
                          <div className="absolute inset-0 bg-indigo-900/10 z-0"></div>
                        )}
                        {data.rubro === rubro.name && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md animate-scaleIn z-10">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      
                      {/* Content Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className={`font-bold text-lg mb-1 leading-tight ${data.rubro === rubro.name ? 'text-indigo-700' : 'text-slate-900'}`}>
                            {rubro.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium line-clamp-2">
                            Optimizado para {rubro.name.toLowerCase()}
                          </p>
                        </div>
                        
                        <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-colors ${
                          data.rubro === rubro.name ? 'border-indigo-100 text-indigo-600' : 'border-slate-50 text-slate-400 group-hover:text-indigo-600'
                        }`}>
                          <span>Seleccionar</span>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            data.rubro === rubro.name ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                          }`}>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">{t('auth.onboarding.business.stockLabel')}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => handleChange('stockType', 'simple')}
                    className={`relative p-6 rounded-3xl border-2 text-left transition-all duration-300 group overflow-hidden ${
                      data.stockType === 'simple' 
                        ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100 scale-[1.02]' 
                        : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-lg'
                    }`}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-50 transition-opacity ${data.stockType === 'simple' ? 'opacity-100' : 'opacity-0'}`}></div>
                    
                    <div className="relative z-10 flex items-start gap-5">
                      <div className={`p-4 rounded-2xl transition-all duration-300 ${data.stockType === 'simple' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 shadow-sm group-hover:scale-110 group-hover:text-indigo-500'}`}>
                        <Box size={32} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 mb-2 text-xl tracking-tight">Simple</div>
                        <div className="text-sm text-slate-500 leading-relaxed font-medium">Solo control de disponible / agotado. Ideal para comida rápida o servicios.</div>
                      </div>
                    </div>
                    {data.stockType === 'simple' && (
                      <div className="absolute top-6 right-6 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 animate-scaleIn">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleChange('stockType', 'complex')}
                    className={`relative p-6 rounded-3xl border-2 text-left transition-all duration-300 group overflow-hidden ${
                      data.stockType === 'complex' 
                        ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100 scale-[1.02]' 
                        : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-lg'
                    }`}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-50 transition-opacity ${data.stockType === 'complex' ? 'opacity-100' : 'opacity-0'}`}></div>

                    <div className="relative z-10 flex items-start gap-5">
                      <div className={`p-4 rounded-2xl transition-all duration-300 ${data.stockType === 'complex' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 shadow-sm group-hover:scale-110 group-hover:text-indigo-500'}`}>
                        <Layers size={32} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 mb-2 text-xl tracking-tight">Avanzado</div>
                        <div className="text-sm text-slate-500 leading-relaxed font-medium">Control de cantidades exactas, costos, movimientos y alertas de stock bajo.</div>
                      </div>
                    </div>
                    {data.stockType === 'complex' && (
                      <div className="absolute top-6 right-6 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 animate-scaleIn">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Preferences (Color & Theme)
        return (
          <div className="animate-fadeIn w-full max-w-5xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">{t('auth.onboarding.preferences.title')}</h2>
            <p className="text-slate-500 mb-10 text-lg">{t('auth.onboarding.preferences.subtitle')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider flex items-center gap-2">
                  <Palette size={18} className="text-slate-400" />
                  Color Principal
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {['blue', 'indigo', 'violet', 'emerald', 'rose', 'orange', 'slate'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleChange('themeColor', color)}
                      className={`aspect-square rounded-3xl transition-all duration-300 focus:outline-none ring-2 ring-offset-4 flex items-center justify-center font-bold text-white uppercase text-xs shadow-sm hover:shadow-md ${
                        data.themeColor === color ? 'ring-slate-900 scale-110 shadow-lg' : 'ring-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: `var(--color-${color}-500, ${getColorHex(color)})` }}
                    >
                      {data.themeColor === color && <Check size={28} strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider flex items-center gap-2">
                  <Moon size={18} className="text-slate-400" />
                  Tema de la interfaz
                </label>
                <div className="space-y-4">
                  <button
                    onClick={() => handleChange('themeMode', 'light')}
                    className={`w-full p-4 rounded-3xl border-2 flex items-center gap-4 transition-all duration-300 ${
                      data.themeMode === 'light' 
                        ? 'border-indigo-600 bg-white shadow-lg ring-1 ring-indigo-500/20' 
                        : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${data.themeMode === 'light' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                      <Sun size={24} />
                    </div>
                    <div className="text-left flex-1">
                      <div className={`font-bold text-lg ${data.themeMode === 'light' ? 'text-indigo-900' : 'text-slate-900'}`}>Claro</div>
                      <div className="text-xs text-slate-500 font-medium">Limpio y brillante, ideal para el día.</div>
                    </div>
                    {data.themeMode === 'light' && <Check size={20} className="text-indigo-600" strokeWidth={3} />}
                  </button>

                  <button
                    onClick={() => handleChange('themeMode', 'dark')}
                    className={`w-full p-4 rounded-3xl border-2 flex items-center gap-4 transition-all duration-300 ${
                      data.themeMode === 'dark' 
                        ? 'border-indigo-600 bg-slate-900 shadow-lg ring-1 ring-indigo-500/20' 
                        : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${data.themeMode === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white text-slate-400 shadow-sm'}`}>
                      <Moon size={24} />
                    </div>
                    <div className="text-left flex-1">
                      <div className={`font-bold text-lg ${data.themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Oscuro</div>
                      <div className={`text-xs font-medium ${data.themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Descanso visual y elegancia.</div>
                    </div>
                    {data.themeMode === 'dark' && <Check size={20} className="text-indigo-400" strokeWidth={3} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Branches
        return (
          <div className="animate-fadeIn w-full max-w-6xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">{t('auth.onboarding.branches.title')}</h2>
            <p className="text-slate-500 mb-10 text-lg">{t('auth.onboarding.branches.subtitle')}</p>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Store size={18} className="text-slate-400" />
                  Tus Sucursales
                </label>
                <button 
                  onClick={addBranch} 
                  className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={18} strokeWidth={2.5} /> 
                  {t('auth.onboarding.branches.addLabel')}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.branches.map((branch, index) => (
                  <div key={branch.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn relative group" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 rounded-l-3xl"></div>
                    <div className="pl-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Store size={24} />
                        </div>
                        {data.branches.length > 1 && (
                          <button 
                            onClick={() => removeBranch(branch.id)}
                            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            title="Eliminar sucursal"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">Nombre de la sucursal</label>
                          <input
                            type="text"
                            value={branch.name}
                            onChange={(e) => updateBranch(branch.id, 'name', e.target.value)}
                            placeholder="Ej: Sucursal Centro"
                            className="w-full text-lg font-bold text-slate-900 placeholder:text-slate-300 bg-transparent border-b-2 border-transparent focus:border-indigo-500 outline-none transition-all py-1"
                            autoFocus={index === data.branches.length - 1 && !branch.name}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">Dirección</label>
                          <input
                            type="text"
                            value={branch.address || ''}
                            onChange={(e) => updateBranch(branch.id, 'address', e.target.value)}
                            placeholder="Av. Corrientes 1234, CABA"
                            className="w-full text-sm font-medium text-slate-700 placeholder:text-slate-300 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={addBranch}
                  className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all duration-300 min-h-[180px]"
                >
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white">
                    <Plus size={24} />
                  </div>
                  <span className="font-bold">Agregar otra sucursal</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 4: // Employees
        return (
          <div className="animate-fadeIn w-full max-w-6xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">{t('auth.onboarding.employees.title')}</h2>
            <p className="text-slate-500 mb-10 text-lg">{t('auth.onboarding.employees.subtitle')}</p>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Users size={18} className="text-slate-400" />
                  Tu Equipo
                </label>
                <button 
                  onClick={addEmployee} 
                  className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-100 transition-colors"
                >
                  <UserPlus size={18} strokeWidth={2.5} /> 
                  {t('auth.onboarding.employees.addLabel')}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.employees.map((employee, index) => (
                  <div key={employee.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 animate-fadeIn relative group" style={{ animationDelay: `${index * 0.1}s` }}>
                    {/* Header with Avatar and Role */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md ${employee.isFixed ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                          {employee.name ? employee.name.substring(0, 2).toUpperCase() : <UserPlus size={24} />}
                        </div>
                        <div>
                          {employee.isFixed ? (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-slate-900">{employee.name}</span>
                              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-200">Tú (Admin)</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={employee.name}
                              onChange={(e) => updateEmployee(employee.id, 'name', e.target.value)}
                              placeholder="Nombre del colaborador"
                              className="font-bold text-lg text-slate-900 placeholder:text-slate-300 bg-transparent border-b border-transparent focus:border-indigo-500 outline-none transition-all w-full"
                            />
                          )}
                          <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                            {employee.isFixed ? <ShieldCheck size={12} className="text-indigo-500" /> : <Users size={12} />}
                            {employee.role}
                          </div>
                        </div>
                      </div>
                      
                      {!employee.isFixed && (
                        <button 
                          onClick={() => removeEmployee(employee.id)}
                          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Mail size={10} /> Email
                          </label>
                          <input
                            type="email"
                            value={employee.email}
                            onChange={(e) => updateEmployee(employee.id, 'email', e.target.value)}
                            disabled={employee.isFixed}
                            placeholder="correo@ejemplo.com"
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Phone size={10} /> Teléfono
                          </label>
                          <input
                            type="tel"
                            value={employee.phone}
                            onChange={(e) => updateEmployee(employee.id, 'phone', e.target.value)}
                            placeholder="+54 11..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {!employee.isFixed && (
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                              <Lock size={10} /> Contraseña
                            </label>
                            <input
                              type="password"
                              value={employee.password}
                              onChange={(e) => updateEmployee(employee.id, 'password', e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                          </div>
                        )}
                        <div className={`space-y-1 ${employee.isFixed ? 'col-span-2' : ''}`}>
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <ShieldCheck size={10} /> Rol
                          </label>
                          {employee.isFixed ? (
                             <div className="w-full bg-indigo-50 border border-indigo-100 rounded-xl py-2 px-3 text-sm font-bold text-indigo-700 flex items-center gap-2">
                               <ShieldCheck size={14} /> Administrador General
                             </div>
                          ) : (
                            <CustomSelect 
                              options={[
                                { value: 'Gerente', label: 'Gerente' },
                                { value: 'Vendedor', label: 'Vendedor' },
                                { value: 'Cajero', label: 'Cajero' },
                                { value: 'Repositor', label: 'Repositor' }
                              ]}
                              value={employee.role}
                              onChange={(val) => updateEmployee(employee.id, 'role', val)}
                              placeholder="Seleccionar rol"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Branch Assignment - Only if multiple branches */}
                    {data.branches.length > 1 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-3 block flex items-center gap-2">
                          <Store size={12} /> Asignar a sucursales
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {data.branches.map(branch => (
                            <button
                              key={branch.id}
                              onClick={() => toggleEmployeeBranch(employee.id, branch.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                                employee.branchIds.includes(branch.id)
                                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {branch.name || 'Sin nombre'}
                              {employee.branchIds.includes(branch.id) && <Check size={12} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <button 
                  onClick={addEmployee}
                  className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all duration-300 min-h-[300px]"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                    <UserPlus size={28} />
                  </div>
                  <span className="font-bold">Agregar nuevo colaborador</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 5: { // Catalog
        const templates = productTemplates[data.rubro] || [];
        const activeProducts = data.products.filter(p => p.isActive);
        const allActive = data.products.every(p => p.isActive);
        const productsReady = activeProducts.filter(p => !p.needsPriceReview && p.customPrice > 0).length;

        return (
          <div className="animate-fadeIn w-full max-w-6xl">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Configura tu catálogo</h2>
            <p className="text-slate-500 mb-8">Selecciona los productos que vas a vender, establece el precio {data.stockType === 'complex' ? 'y stock inicial' : ''}</p>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600">
                  <span className="font-bold text-slate-900">{activeProducts.length}</span> de <span className="font-bold">{templates.length}</span> seleccionados
                  <span className="mx-2">•</span>
                  <span className="font-bold text-green-600">{productsReady}</span> listos
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleAllProducts(templates)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors"
                >
                  {allActive ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Vista de cuadrícula"
                  >
                    <Grid size={18} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Vista de lista"
                  >
                    <List size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>

            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2"
              : "flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2"
            }>
              {data.products.map((product, index) => {
                const isActive = product.isActive;
                const hasPrice = product.customPrice > 0;
                const needsReview = product.needsPriceReview;
                const isReady = isActive && hasPrice && !needsReview;
                const minPrice = product.price - 300;
                const maxPrice = product.price + 300;
                const cat = getCategoryById(product.category?.[0] || 'otros');
                const Icon = cat?.icon || Package;
                const colorClass = cat?.color || 'text-slate-500 bg-slate-50';

                return (
                  <ProductCard
                    key={index}
                    product={product}
                    categoryData={cat}
                    viewMode={viewMode}
                    isSelected={isActive}
                    onClick={() => toggleProduct(product)}
                    showActions={false}
                    className={
                      !isActive
                        ? 'border-slate-200 bg-slate-50 opacity-60'
                        : isReady 
                          ? 'border-green-500 bg-green-50/50 shadow-md'
                          : needsReview
                            ? 'border-yellow-500 bg-yellow-50/50 shadow-sm'
                            : 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                    }
                  >
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-slate-500 font-medium">Sugerido: ${product.price}</div>
                        {isReady && (
                          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
                            <Check size={10} strokeWidth={3} /> OK
                          </div>
                        )}
                        {needsReview && isActive && (
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">
                            ⚠️
                          </div>
                        )}
                      </div>

                      {isActive && (
                        <div className="space-y-2 pt-3 border-t border-slate-200/50">
                          <div className={viewMode === 'grid' && data.stockType === 'complex' ? "grid grid-cols-2 gap-2" : "flex gap-2"}>
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Precio *</label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">$</span>
                                <input
                                  type="number"
                                  value={product.customPrice || ''}
                                  onChange={(e) => updateProductField(product.name, 'customPrice', parseInt(e.target.value) || 0)}
                                  placeholder={product.price.toString()}
                                  min={minPrice}
                                  max={maxPrice}
                                  className={`w-full pl-6 pr-2 py-1.5 border-2 rounded-lg font-bold text-sm outline-none transition-all ${
                                    isReady
                                      ? 'border-green-300 bg-white focus:border-green-500'
                                      : needsReview
                                        ? 'border-yellow-300 bg-yellow-50 focus:border-yellow-500'
                                        : 'border-slate-200 bg-white focus:border-indigo-500'
                                  }`}
                                />
                              </div>
                            </div>
                            
                            {data.stockType === 'complex' && (
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Stock</label>
                                <input
                                  type="number"
                                  value={product.stock || ''}
                                  onChange={(e) => updateProductField(product.name, 'stock', parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                  min={0}
                                  className="w-full px-2 py-1.5 border-2 border-slate-200 rounded-lg font-bold text-sm outline-none focus:border-indigo-500 transition-all bg-white"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </ProductCard>
                );
              })}
            </div>
            
            {templates.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-500">Selecciona un rubro primero</p>
              </div>
            )}
          </div>
        );
      }

      case 6: // Finish
        return (
          <div className="text-center animate-fadeIn">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <Check size={48} strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">
              {t('auth.onboarding.finish.title')}
            </h2>
            <p className="text-xl text-slate-500 max-w-lg mx-auto mb-10">
              {t('auth.onboarding.finish.subtitle')}
            </p>
            <div className="bg-slate-50 p-8 rounded-3xl max-w-md mx-auto mb-10 text-left border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4 text-lg">Resumen de cuenta</h4>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">Rubro</span> 
                  <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-100">{data.rubro || '-'}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">Sucursales</span> 
                  <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-100">{data.branches.length}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">Miembros</span> 
                  <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-100">{data.employees.length}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">Productos Iniciales</span> 
                  <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-100">{data.products.length}</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/app')}
              className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-xl shadow-slate-900/20 transform hover:-translate-y-1"
            >
              {t('auth.onboarding.finish.goToDashboard')}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Sidebar - Progress (Hidden on mobile) */}
      <div className="hidden md:flex w-full md:w-80 bg-slate-50 border-r border-slate-100 p-8 flex-col justify-between relative z-20">
        <div>
          <div className="font-display font-bold text-2xl text-slate-900 mb-12 flex items-center gap-3">
            <img src={logo} alt="Gestly" className="w-8 h-auto object-contain" />
            Gestly
          </div>
          
          <nav className="space-y-6 relative">
            {/* Connector Line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200 -z-10"></div>
            
            {steps.map((s, index) => (
              <div 
                key={s.key}
                className={`flex items-center gap-4 relative ${
                  index === step 
                    ? 'text-slate-900 font-bold' 
                    : index < step 
                      ? 'text-slate-500 font-medium' 
                      : 'text-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all bg-white z-10 ${
                  index === step 
                    ? 'border-slate-900 text-slate-900 scale-110 shadow-lg' 
                    : index < step 
                      ? 'border-green-500 text-green-600' 
                      : 'border-slate-200'
                }`}>
                  {index < step ? <Check size={14} strokeWidth={3} /> : index + 1}
                </div>
                <span className="text-sm tracking-wide">{t(`auth.onboarding.steps.${s.key}`)}</span>
              </div>
            ))}
          </nav>
        </div>
        
        <div className="text-xs font-bold text-slate-300 mt-8 uppercase tracking-widest">
          © {new Date().getFullYear()} Gestly
        </div>
      </div>

      {/* Mobile Header (Visible only on mobile) */}
      <div className="md:hidden p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
         <div className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <img src={logo} alt="Gestly" className="w-6 h-auto object-contain" />
            Gestly
         </div>
         <div className="text-sm font-bold text-slate-500">
           Paso {step + 1} de {steps.length}
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
        
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10 overflow-y-auto">
          {renderStep()}
        </div>

        {/* Navigation Buttons (Bottom) */}
        {step > 0 && step < steps.length - 1 && (
          <div className="p-6 border-t border-slate-50 flex justify-between items-center bg-white/90 backdrop-blur-md sticky bottom-0 z-20">
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              {t('auth.onboarding.business.back')}
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2"
            >
              {t('auth.onboarding.business.next')}
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
