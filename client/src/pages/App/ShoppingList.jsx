import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  ListTodo, 
  Check, 
  Search, 
  Plus, 
  Trash2, 
  Wand2, 
  Package, 
  FileDown,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
  Edit2,
  Store,
  Sparkles,
  X,
  Save,
  ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ShoppingList = () => {
  const { selectedBranch } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // pending, completed
  
  // Simulated lists instead of just items
  const [lists, setLists] = useState([
    {
      id: 'L1',
      name: 'Compra Semanal Mayorista',
      date: '2026-04-16',
      status: 'pending',
      branch: 'centro',
      items: [
        { id: 1, name: 'Coca Cola 500ml', quantity: 24, checked: false, reason: 'Stock Crítico', cost: 1200, isCostUpdated: false, currentStock: 5 },
        { id: 2, name: 'Cerveza Quilmes 1L', quantity: 12, checked: false, reason: 'Alta Demanda', cost: 2500, isCostUpdated: false, currentStock: 40 },
      ]
    },
    {
      id: 'L2',
      name: 'Reposición Kiosco',
      date: '2026-04-15',
      status: 'pending',
      branch: 'norte',
      items: [
        { id: 3, name: 'Alfajor Jorgito', quantity: 50, checked: false, reason: 'Manual', cost: null, isCostUpdated: false, currentStock: 2 }, // Costo incógnita
        { id: 4, name: 'Galletitas Oreo', quantity: 15, checked: true, reason: 'Agotado', cost: 1600, isCostUpdated: true, currentStock: 0 },
      ]
    },
    {
      id: 'L3',
      name: 'Urgente Finde',
      date: '2026-04-10',
      status: 'completed',
      branch: 'all',
      items: [
        { id: 5, name: 'Hielo 2kg', quantity: 10, checked: true, reason: 'Alta Demanda', cost: 800, isCostUpdated: true, currentStock: 15 },
        { id: 6, name: 'Carbón', quantity: 5, checked: true, reason: 'Alta Demanda', cost: 1500, isCostUpdated: true, currentStock: 2 },
      ]
    }
  ]);

  const [selectedListId, setSelectedListId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaEditForm, setMetaEditForm] = useState({ name: '', date: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [defaultQty, setDefaultQty] = useState(5);
  const [suggestionModal, setSuggestionModal] = useState(null);
  
  // Mock del catálogo (debería venir del estado global/contexto)
  const catalogProducts = [
    { id: 1, name: 'Coca Cola 500ml', cost: 1200, currentStock: 5 },
    { id: 2, name: 'Cerveza Quilmes 1L', cost: 2500, currentStock: 40 },
    { id: 3, name: 'Alfajor Jorgito', cost: 800, currentStock: 2 },
    { id: 4, name: 'Galletitas Oreo', cost: 1600, currentStock: 0 },
    { id: 5, name: 'Hielo 2kg', cost: 800, currentStock: 15 },
    { id: 6, name: 'Carbón', cost: 1500, currentStock: 2 },
    { id: 7, name: 'Papas Fritas Lays', cost: 1400, currentStock: 1 },
    { id: 8, name: 'Agua Mineral 2L', cost: 800, currentStock: 40 },
  ];

  // Funciones para la vista de detalle de lista
  const currentList = lists.find(l => l.id === selectedListId);

  const toggleCheckItem = (listId, itemId) => {
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      return {
        ...list,
        items: list.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
      };
    }));
  };

  const updateItemCost = (listId, itemId, newCost) => {
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      return {
        ...list,
        items: list.items.map(item => item.id === itemId ? { ...item, cost: Number(newCost), isCostUpdated: true } : item)
      };
    }));
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleEditMetaSubmit = () => {
    if (!metaEditForm.name.trim()) return;
    setLists(prev => prev.map(list => {
      if (list.id !== selectedListId) return list;
      return { ...list, name: metaEditForm.name, date: metaEditForm.date };
    }));
    setIsEditingMeta(false);
  };

  const markListAsCompleted = (listId) => {
    const listToComplete = lists.find(l => l.id === listId);
    if (!listToComplete) return;

    // Calculate final cost to show in toast
    const finalCost = listToComplete.items.reduce((sum, item) => sum + ((item.cost || 0) * item.quantity), 0);

    // Guardar en localStorage para que se refleje en Dashboard y Ventas
    if (finalCost > 0) {
      const existingExpenses = JSON.parse(localStorage.getItem('gestly_mock_expenses') || '[]');
      existingExpenses.push({
        id: `EXP-${Date.now()}`,
        date: new Date().toISOString(),
        amount: finalCost,
        description: `Compra Mercadería: ${listToComplete.name}`,
        branch: listToComplete.branch
      });
      localStorage.setItem('gestly_mock_expenses', JSON.stringify(existingExpenses));
      
      // Dispatch event para actualizar otras vistas si están abiertas
      window.dispatchEvent(new Event('gestly_expenses_updated'));
    }

    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      return {
        ...list,
        status: 'completed',
        items: list.items.map(item => ({ ...item, checked: true })) // Auto check all
      };
    }));
    
    setSelectedListId(null);
    showToast(`¡Lista completada! Se registró un egreso de $${finalCost.toLocaleString()} en la caja y en ventas/fiados.`);
  };

  const removeItem = (listId, itemId) => {
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      return { ...list, items: list.items.filter(i => i.id !== itemId) };
    }));
  };

  const addItemFromCatalog = (product, quantity) => {
    if (quantity <= 0) return;
    
    setLists(prev => prev.map(list => {
      if (list.id !== selectedListId) return list;
      
      const existingItem = list.items.find(i => i.id === product.id);
      let newItems;
      
      if (existingItem) {
        newItems = list.items.map(i => 
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        newItems = [...list.items, {
          id: product.id,
          name: product.name,
          quantity: quantity,
          checked: false,
          reason: 'Manual',
          cost: product.cost,
          isCostUpdated: false,
          currentStock: product.currentStock
        }];
      }
      return { ...list, items: newItems };
    }));
    
    showToast(`Se añadieron ${quantity} u. de ${product.name} a la lista.`);
  };

  const createNewList = () => {
    const newList = {
      id: `L${Date.now()}`,
      name: `Nueva Lista ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      branch: selectedBranch === 'all' ? 'centro' : selectedBranch,
      items: []
    };
    setLists([newList, ...lists]);
    setSelectedListId(newList.id);
  };

  const handleAutoGenerate = (type) => {
    const ts = Date.now();
    const items = type === 'lowStock'
      ? [
          { id: `suggest-${ts}`, name: 'Alfajor Jorgito', quantity: 10, checked: true, reason: 'Stock Crítico', cost: 800, currentStock: 2 },
          { id: `suggest-${ts + 1}`, name: 'Papas Fritas Lays', quantity: 5, checked: true, reason: 'Stock Crítico', cost: 1400, currentStock: 1 }
        ]
      : [
          { id: `suggest-${ts}`, name: 'Agua Mineral 2L', quantity: 20, checked: true, reason: 'Alta Demanda', cost: 800, currentStock: 40 }
        ];
    setSuggestionModal({ type, items });
  };

  const toggleSuggestItem = (itemId) => {
    setSuggestionModal(prev => prev ? {
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i)
    } : prev);
  };

  const updateSuggestItemQty = (itemId, qty) => {
    setSuggestionModal(prev => prev ? {
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, quantity: Math.max(1, Number(qty)) } : i)
    } : prev);
  };

  const addSuggestedItems = () => {
    if (!suggestionModal) return;
    suggestionModal.items.filter(i => i.checked).forEach(item => {
      setLists(prev => prev.map(list => {
        if (list.id !== selectedListId) return list;
        return { ...list, items: [...list.items, { ...item, id: Date.now() + Math.random(), isCostUpdated: false, checked: false }] };
      }));
    });
    showToast(`Se añadieron ${suggestionModal.items.filter(i => i.checked).length} productos a la lista.`);
    setSuggestionModal(null);
  };

  const exportPDF = (list) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text(`Lista: ${list.name}`, 14, 22);
    
    // Subtitle
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha: ${list.date} | Sucursal: ${list.branch === 'all' ? 'Todas' : list.branch}`, 14, 30);
    
    const tableColumn = ["Producto", "Cantidad", "Motivo", "Costo U.", "Total"];
    const tableRows = [];

    let totalEgresos = 0;

    list.items.forEach(item => {
      const itemTotal = item.quantity * (item.cost || 0);
      totalEgresos += itemTotal;
      
      const itemData = [
        item.name,
        `${item.quantity} u.`,
        item.reason,
        item.cost ? `$${item.cost.toLocaleString()}` : 'A Confirmar',
        item.cost ? `$${itemTotal.toLocaleString()}` : 'A Confirmar'
      ];
      tableRows.push(itemData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] }, // indigo-600
      foot: [
        ['', '', '', 'Total Estimado:', `$${totalEgresos.toLocaleString()}`]
      ],
      footStyles: { fillColor: [241, 245, 249], textColor: [17, 24, 39], fontStyle: 'bold' }
    });

    doc.save(`Lista_${list.name.replace(/\s+/g, '_')}_${list.date}.pdf`);
  };

  // View: Main List of Lists
  if (!selectedListId) {
    const filteredLists = lists.filter(list => {
      const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = list.status === activeTab;
      const matchesBranch = selectedBranch === 'all' || list.branch === selectedBranch || list.branch === 'all';
      return matchesSearch && matchesTab && matchesBranch;
    });

    return (
      <div className="p-4 md:p-5 min-h-full flex flex-col w-full max-w-[1600px] mx-auto w-full">
        
        {/* Onboarding Banner IA */}
        {lists.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white mb-8 shadow-2xl shadow-slate-900/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none transition-all duration-700 group-hover:bg-indigo-500/20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none transition-all duration-700 group-hover:bg-blue-500/20"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 mb-4 backdrop-blur-sm">
                  <Sparkles className="text-indigo-400" size={14} />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Gestly Inteligente</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-black mb-3 text-white">
                  No pienses qué falta, nosotros lo hacemos.
                </h2>
                <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
                  Ey, ¿sabías que podés crear tu lista de compras rápidamente autocompletando con lo que te falta en stock o lo que más vendés? Creá tu primera lista y probá las sugerencias inteligentes.
                </p>
              </div>
              <button 
                onClick={createNewList}
                className="shrink-0 bg-indigo-600 border border-indigo-500/50 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-500 hover:-translate-y-1 transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95"
              >
                <Plus size={18} />
                Crear Mi Primera Lista
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="app-page-title">Listas de Compras</h1>
            <p className="app-page-subtitle mt-0.5">
              Gestiona abastecimientos {selectedBranch !== 'all' ? `para Sucursal ${selectedBranch === 'centro' ? 'Centro' : 'Norte'}` : 'globalmente'}
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={createNewList}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
            >
              <Plus size={18} />
              Nueva Lista
            </button>
          </div>
        </div>

        {/* Toolbar & Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-l border-r border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col sm:flex-row justify-between gap-4 relative z-10">
          <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'pending' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Clock size={16} /> Pendientes
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'completed' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Check size={16} /> Completadas
            </button>
          </div>

          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar lista por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-slate-900 dark:focus:border-slate-400 transition-colors dark:text-white"
            />
          </div>
        </div>

        {/* Lists Grid */}
        <div className="bg-slate-50/50 dark:bg-slate-950/50 p-6 rounded-b-3xl border border-slate-200 dark:border-slate-800 flex-1">
          {filteredLists.length === 0 ? (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500">
              <ListTodo size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium text-lg">No hay listas {activeTab === 'pending' ? 'pendientes' : 'completadas'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLists.map(list => {
                const totalItems = list.items.length;
                const checkedItems = list.items.filter(i => i.checked).length;
                const progress = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);
                const estimatedCost = list.items.reduce((sum, item) => sum + ((item.cost || 0) * item.quantity), 0);

                return (
                  <div 
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-indigo-500/10 transition-colors"></div>
                    
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                        list.status === 'completed' 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' 
                          : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20'
                      }`}>
                        <ListTodo size={20} />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar size={11} /> {list.date}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 text-slate-400 dark:text-slate-500">
                          {list.branch === 'all' ? 'Global' : list.branch === 'centro' ? 'Centro' : 'Norte'}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-black text-base text-slate-900 dark:text-white mb-2 relative z-10 line-clamp-1">{list.name}</h3>
                    
                    <div className="mb-3 relative z-10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Progreso</span>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{checkedItems}/{totalItems}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${list.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-3 border-t border-slate-100 dark:border-slate-800 relative z-10">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Costo Est.</p>
                        <p className="text-base font-black text-slate-900 dark:text-white">${estimatedCost.toLocaleString()}</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 flex items-center justify-center transition-colors">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // View: Ticket Detail View
  const estimatedCost = currentList.items.reduce((sum, item) => sum + ((item.cost || 0) * item.quantity), 0);
  const pendingCount = currentList.items.filter(i => !i.checked).length;
  const missingCostsCount = currentList.items.filter(i => i.cost === null || i.cost === 0).length;

  return (
    <div className="p-6 min-h-full flex flex-col max-w-5xl mx-auto w-full">
      {/* Header Detail */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => setSelectedListId(null)}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm shrink-0"
          >
            <ArrowRight size={20} className="rotate-180" />
          </button>
          
          {isEditingMeta ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
              <input 
                type="text" 
                value={metaEditForm.name}
                onChange={e => setMetaEditForm({...metaEditForm, name: e.target.value})}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 w-full sm:w-auto"
                placeholder="Nombre de la lista"
              />
              <input 
                type="date" 
                value={metaEditForm.date}
                onChange={e => setMetaEditForm({...metaEditForm, date: e.target.value})}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleEditMetaSubmit}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Save size={18} />
              </button>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <h1 className="app-page-title flex items-center gap-2 flex-wrap">
                <span className="truncate">{currentList.name}</span>
                {currentList.status === 'completed' && (
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-black shrink-0">
                    Completada
                  </span>
                )}
                {currentList.status === 'pending' && (
                  <button 
                    onClick={() => {
                      setMetaEditForm({ name: currentList.name, date: currentList.date });
                      setIsEditingMeta(true);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </h1>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                <Calendar size={14}/> {currentList.date} | <Store size={14}/> {currentList.branch === 'all' ? 'Global' : currentList.branch === 'centro' ? 'Centro' : 'Norte'}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 flex flex-col items-end shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Estimado</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">${estimatedCost.toLocaleString()}</span>
          </div>
          <button 
            onClick={() => exportPDF(currentList)}
            className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-12 h-12 md:w-auto md:px-4 md:py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm shrink-0"
            title="Exportar PDF"
          >
            <FileDown size={18} />
            <span className="hidden md:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Auto-generators (Only if pending) */}
      {currentList.status === 'pending' && (
        <div className="space-y-2 mb-4">
          <button 
            onClick={() => handleAutoGenerate('lowStock')}
            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-red-300 dark:hover:border-red-800 hover:shadow-md transition-all group text-left active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-900 dark:text-white">Stock Crítico</p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Productos con menos de 10 u. — seleccioná cuáles añadir</p>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0" />
          </button>

          <button 
            onClick={() => handleAutoGenerate('topSellers')}
            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition-all group text-left active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp size={18} className="text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-900 dark:text-white">Más Vendidos</p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Sugerencias inteligentes — seleccioná cuáles añadir</p>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0" />
          </button>
        </div>
      )}

      {missingCostsCount > 0 && currentList.status === 'pending' && (
        <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-3 rounded-xl flex items-start gap-2">
          <AlertTriangle size={16} className="text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-indigo-800 dark:text-indigo-400 text-xs">{missingCostsCount} productos sin costo</h4>
            <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">Podés completar la lista igual, los costos vacíos no generarán egreso.</p>
          </div>
        </div>
      )}

      {/* Ticket List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col flex-1 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 dark:bg-slate-800" style={{ backgroundImage: 'radial-gradient(circle, transparent 4px, #f8fafc 4px, #f8fafc 6px, transparent 6px)', backgroundSize: '16px 16px', backgroundPosition: '-8px -8px' }}></div>
        
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center mt-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
              {pendingCount} pendientes
            </span>
          </div>
          {currentList.status === 'pending' && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Añadir Ítem
            </button>
          )}
        </div>

        <div className="flex-1 p-4 sm:p-6 bg-slate-50/30 dark:bg-slate-950/30">
          {currentList.items.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <ListTodo size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium text-sm">Lista vacía</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentList.items.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                    item.checked 
                      ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-70' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  {currentList.status === 'pending' && (
                    <button 
                      onClick={() => toggleCheckItem(currentList.id, item.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        item.checked 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400 bg-transparent'
                      }`}
                    >
                      {item.checked && <Check size={11} strokeWidth={3} />}
                    </button>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm truncate ${item.checked ? 'line-through text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {item.name}
                      </p>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">{item.quantity}u</span>
                      {item.reason && (
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase hidden sm:inline">{item.reason}</span>
                      )}
                    </div>
                    {item.currentStock !== undefined && (
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                        <Package size={9} />
                        <span>Stock {item.currentStock}</span>
                        <ArrowRight size={9} className="text-indigo-400" />
                        <span className={item.checked ? 'text-emerald-500' : 'text-indigo-500'}>{item.currentStock + item.quantity}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`flex items-center gap-0.5 bg-slate-50 dark:bg-slate-950 px-1.5 py-1 rounded-lg border focus-within:border-indigo-400 transition-colors ${!item.cost ? 'border-amber-200 dark:border-amber-800/50' : 'border-slate-200 dark:border-slate-700'}`}>
                      <span className="text-[10px] font-bold text-slate-400">$</span>
                      <input 
                        type="number"
                        value={item.cost || ''}
                        onChange={(e) => updateItemCost(currentList.id, item.id, e.target.value)}
                        placeholder="?"
                        disabled={currentList.status === 'completed'}
                        className="w-12 bg-transparent text-right text-xs font-bold text-slate-900 dark:text-white outline-none disabled:opacity-70"
                      />
                    </div>
                    
                    <div className="w-14 text-right">
                      <p className={`font-black text-xs ${item.checked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {item.cost ? `$${(item.quantity * item.cost).toLocaleString()}` : '---'}
                      </p>
                    </div>

                    {currentList.status === 'pending' && (
                      <button 
                        onClick={() => removeItem(currentList.id, item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {currentList.status === 'pending' && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-3xl space-y-2">
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedListId(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Save size={15} />
                Guardar Lista
              </button>
              <button 
                onClick={() => markListAsCompleted(currentList.id)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check size={15} />
                Finalizar
              </button>
            </div>
            {missingCostsCount > 0 && (
              <p className="text-center text-[9px] font-bold text-amber-500">{missingCostsCount} productos sin costo — se completarán sin egreso.</p>
            )}
            {missingCostsCount === 0 && (
              <p className="text-center text-[9px] font-bold text-slate-400">Al finalizar se marcarán todos como comprados y se registrarán los costos.</p>
            )}
          </div>
        )}
      </div>

      {/* Suggestion Modal */}
      {suggestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${suggestionModal.type === 'lowStock' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500'}`}>
                  {suggestionModal.type === 'lowStock' ? <AlertTriangle size={16} /> : <TrendingUp size={16} />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {suggestionModal.type === 'lowStock' ? 'Stock Crítico' : 'Más Vendidos'}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Seleccioná los productos a añadir</p>
                </div>
              </div>
              <button 
                onClick={() => setSuggestionModal(null)}
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-1.5">
              {suggestionModal.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleSuggestItem(item.id)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-xs ${item.checked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500'}`}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-slate-400">Stock: {item.currentStock}</span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">${item.cost}/u</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateSuggestItemQty(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateSuggestItemQty(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div className="flex gap-2">
                <button 
                  onClick={() => setSuggestionModal(null)}
                  className="flex-1 py-2 rounded-xl font-bold text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={addSuggestedItems}
                  className="flex-1 py-2 rounded-xl font-bold text-[10px] bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-1"
                >
                  <Plus size={14} />
                  Agregar ({suggestionModal.items.filter(i => i.checked).length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Items Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Package size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Catálogo</h2>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Selecciona qué comprar</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input 
                  type="text" 
                  placeholder="Buscar en el catálogo..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">Cant. por defecto:</span>
                <div className="flex items-center gap-1">
                  {[5, 10, 24, 48].map(n => (
                    <button
                      key={n}
                      onClick={() => setDefaultQty(n)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${defaultQty === n ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={defaultQty}
                  onChange={(e) => setDefaultQty(Math.max(1, Number(e.target.value)))}
                  className="w-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold outline-none text-center focus:border-indigo-500 dark:text-white"
                  min="1"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              <div className="space-y-1.5">
                {catalogProducts
                  .filter(p => p.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                  .map(product => (
                    <div key={product.id} className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                      <div className="flex-1 min-w-0 mr-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-bold text-slate-400">Stock: {product.currentStock}</span>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">${product.cost}/u</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number"
                          defaultValue={defaultQty}
                          min="1"
                          id={`qty-${product.id}`}
                          className="w-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold outline-none text-center focus:border-indigo-500 dark:text-white"
                        />
                        <button 
                          onClick={() => {
                            const input = document.getElementById(`qty-${product.id}`);
                            const qty = Math.max(1, parseInt(input?.value) || defaultQty);
                            addItemFromCatalog(product, qty);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 flex gap-2">
              <button
                onClick={() => {
                  catalogProducts.forEach(p => addItemFromCatalog(p, defaultQty));
                }}
                className="flex-1 py-2 rounded-lg font-bold text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
              >
                +{defaultQty} de cada uno
              </button>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2 rounded-lg font-bold text-[10px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-all hover:bg-slate-800 dark:hover:bg-slate-100"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center gap-3 z-50 animate-bounce">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Check size={16} strokeWidth={3} />
          </div>
          <p className="font-bold text-sm">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;