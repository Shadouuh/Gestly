import { useEffect, useState } from 'react'
import { 
  AlertCircle, CheckCircle, Package, Settings, Users, Check, Store, 
  ShoppingBasket, Coffee, Croissant, CakeSlice, BookOpen, Hammer, 
  Clock, Calculator, ChefHat, ScrollText, Search, Plus, Trash2, 
  ArrowRight, ArrowLeft, Loader2, Smile, HelpCircle, BarChart3, CreditCard,
  Building2, MapPin, UserPlus, Shield, X, Eye
} from 'lucide-react'

import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { useAuthStore } from '@shared/stores/authStore'
import { useToastStore } from '@shared/stores/toastStore'
import { patchBusiness, createProduct } from '@shared/services/posService'
import { listAccounts, createEmployeeAccount, updateAccount, type AccountAdminRecord } from '@shared/services/authService'
import { RUBROS, type Template, type TemplateItem } from '../productos/templates'

const ICON_MAP: Record<string, any> = {
  Store, ShoppingBasket, Coffee, Croissant, CakeSlice, BookOpen, Hammer
}

type Tab = 'asistente' | 'negocio' | 'usuarios'
type WizardStep = 'STRUCTURE' | 'BRANCHES' | 'RUBRO' | 'STOCK_MODE' | 'TEMPLATE' | 'CUSTOMIZE' | 'TEAM' | 'SUCCESS'
type AssistantMission = 'SETUP' | 'SALE' | 'FIADO' | 'ANALYTICS' | 'NONE'

// --- Types ---
type Branch = {
  id: string
  name: string
  address: string
  stockMode: 'simple' | 'complete'
  products: TemplateItem[]
}

type TeamMember = {
  id: string
  name: string
  email: string
  password?: string
  role: 'admin' | 'vendedor' | 'gerente'
  branchId: string // 'all' or specific branch ID (primary context)
  branchIds?: string[] // Multi-branch access
}

export function ConfiguracionPage() {
  const business = useAuthStore((s) => s.business)
  const setBusiness = useAuthStore((s) => s.updateBusiness)
  const showToast = useToastStore((s) => s.showToast)

  const [activeTab, setActiveTab] = useState<Tab>('asistente')
  
  // Business Settings State
  const [isMultiBranch, setIsMultiBranch] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([
    { id: 'main', name: 'Sucursal Central', address: '', stockMode: 'complete', products: [] }
  ])
  const [activeBranchId, setActiveBranchId] = useState('main')

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState<Partial<TeamMember>>({ role: 'vendedor', branchId: 'all' })
  const [selectedExistingUser, setSelectedExistingUser] = useState<string>('')
  const [isAddingExistingUser, setIsAddingExistingUser] = useState(false)

  // Accounts State (Real Backend Data)
  const [accountsStatus, setAccountsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [accounts, setAccounts] = useState<AccountAdminRecord[]>([])
  const [accountsError, setAccountsError] = useState('')

  // Assistant State
  const [activeMission, setActiveMission] = useState<AssistantMission>('NONE')
  const [step, setStep] = useState<WizardStep>('STRUCTURE')
  
  // Wizard Data State
  const [selectedRubroId, setSelectedRubroId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Initialize data
  useEffect(() => {
    if (business) {
      if (business.rubro && business.rubro !== 'general') {
        setSelectedRubroId(business.rubro)
      }
      setIsMultiBranch(business.tieneMultiplesSucursales ?? false)
      
      if (business.branches && business.branches.length > 0) {
        setBranches(business.branches.map(b => ({
          id: b.id,
          name: b.name,
          address: b.address || '',
          stockMode: (business.stockMode as any) || 'complete',
          products: []
        })))
      } else {
        setBranches([{ 
          id: 'main', 
          name: business.nombre, 
          address: business.ubicacion, 
          stockMode: (business.stockMode as any) || 'complete',
          products: [] 
        }])
      }
    }
  }, [business])

  // Load accounts
  const loadAccounts = async () => {
    if (!business) return
    setAccountsStatus('loading')
    try {
      const accounts = await listAccounts(business.id)
      setAccounts(accounts)
      setAccountsStatus('success')
    } catch (e: unknown) {
      setAccountsStatus('error')
      setAccountsError(e instanceof Error ? e.message : 'Error al cargar usuarios')
    }
  }

  useEffect(() => {
    void loadAccounts()
  }, [business])

  const handleCreateEmployee = async () => {
    if (!business || !newUser.name || !newUser.email || !newUser.password) {
      showToast('Completá todos los campos obligatorios', 'error')
      return
    }
    
    setIsSaving(true)
    try {
      await createEmployeeAccount({
        businessId: business.id,
        nombre: newUser.name,
        email: newUser.email,
        password: newUser.password,
        rol: newUser.role || 'vendedor',
        branchId: newUser.branchId || 'main'
      })
      showToast('Usuario creado correctamente', 'success')
      setShowAddUser(false)
      setNewUser({ role: 'vendedor', branchId: 'all' })
      void loadAccounts()
    } catch (e) {
      showToast('Error al crear usuario', 'error')
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  // --- HANDLERS ---

  const handleAddBranch = async () => {
    if (!business) return
    const newId = `branch-${Date.now()}`
    const newBranch = { 
      id: newId, 
      name: `Nueva Sucursal ${branches.length + 1}`, 
      address: '', 
      stockMode: (business.stockMode as any) || 'complete',
      products: []
    }
    const updatedBranches = [...branches, newBranch]
    setBranches(updatedBranches)
    
    // Auto-save if we are not in wizard
    if (activeTab === 'usuarios') {
      try {
        await patchBusiness(business.id, {
          tieneMultiplesSucursales: true,
          branches: updatedBranches.map(b => ({ id: b.id, name: b.name, address: b.address }))
        })
        setBusiness({ ...business, tieneMultiplesSucursales: true, branches: updatedBranches.map(b => ({ id: b.id, name: b.name, address: b.address })) })
        showToast('Sucursal creada', 'success')
      } catch (e) {
        showToast('Error al guardar sucursal', 'error')
      }
    } else {
      setActiveBranchId(newId)
    }
  }

  const handleUpdateBranch = async (branchId: string, data: Partial<Branch>) => {
    if (!business) return
    const updatedBranches = branches.map(b => b.id === branchId ? { ...b, ...data } : b)
    setBranches(updatedBranches)
    
    // Debounced save could be better, but direct save for now
    try {
      await patchBusiness(business.id, {
        branches: updatedBranches.map(b => ({ id: b.id, name: b.name, address: b.address }))
      })
      setBusiness({ ...business, branches: updatedBranches.map(b => ({ id: b.id, name: b.name, address: b.address })) })
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteBranch = async (branchId: string) => {
    if (!business) return
    const updatedBranches = branches.filter(b => b.id !== branchId)
    setBranches(updatedBranches)
    
    try {
      await patchBusiness(business.id, {
        branches: updatedBranches.map(b => ({ id: b.id, name: b.name, address: b.address })),
        tieneMultiplesSucursales: updatedBranches.length > 1
      })
      setBusiness({ ...business, tieneMultiplesSucursales: updatedBranches.length > 1, branches: updatedBranches.map(b => ({ id: b.id, name: b.name, address: b.address })) })
      showToast('Sucursal eliminada', 'success')
    } catch (e) {
      showToast('Error al eliminar', 'error')
    }
  }

  const handleStructureSelect = (multi: boolean) => {
    setIsMultiBranch(multi)
    if (multi) {
      setStep('BRANCHES')
    } else {
      // Reset to single branch if switching back
      setBranches([branches[0]])
      setStep('RUBRO')
    }
  }

  const handleBranchesConfirm = () => {
    setStep('RUBRO')
  }

  const handleRubroSelect = (id: string) => {
    setSelectedRubroId(id)
    setStep('STOCK_MODE')
  }

  const handleStockModeSelect = (mode: 'simple' | 'complete') => {
    // Apply to active branch (usually main at this point, but could be specific if we flow differently)
    // For simplicity in wizard, we set a default for all, or current active
    const updatedBranches = branches.map(b => ({ ...b, stockMode: mode }))
    setBranches(updatedBranches)
    setStep('TEMPLATE')
  }

  const handleTemplateSelect = (template: Template | null) => {
    if (template) {
      // Apply template products to ALL branches initially, user can customize per branch later
      const updatedBranches = branches.map(b => ({ ...b, products: [...template.items] }))
      setBranches(updatedBranches)
    } else {
      const updatedBranches = branches.map(b => ({ ...b, products: [] }))
      setBranches(updatedBranches)
    }
    setActiveBranchId(branches[0].id) // Start customizing first branch
    setStep('CUSTOMIZE')
  }

  const handleAddProduct = () => {
    const newProduct: TemplateItem = {
      nombre: '',
      categoria: 'General',
      unidad: 'u',
      priceCents: 0,
      costCents: 0,
      stock: 0,
      trackStock: true,
      disponible: true
    }
    const updatedBranches = branches.map(b => {
      if (b.id === activeBranchId) {
        return { ...b, products: [newProduct, ...b.products] }
      }
      return b
    })
    setBranches(updatedBranches)
  }

  const handleRemoveProduct = (index: number) => {
    const updatedBranches = branches.map(b => {
      if (b.id === activeBranchId) {
        const newProducts = [...b.products]
        newProducts.splice(index, 1)
        return { ...b, products: newProducts }
      }
      return b
    })
    setBranches(updatedBranches)
  }

  const handleProductChange = (index: number, field: keyof TemplateItem, value: any) => {
    const updatedBranches = branches.map(b => {
      if (b.id === activeBranchId) {
        const newProducts = [...b.products]
        newProducts[index] = { ...newProducts[index], [field]: value }
        return { ...b, products: newProducts }
      }
      return b
    })
    setBranches(updatedBranches)
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return
    const member: TeamMember = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      password: newUser.password || '123456',
      role: newUser.role as any,
      branchId: newUser.branchId || 'all'
    }
    setTeamMembers([...teamMembers, member])
    setNewUser({ role: 'vendedor', branchId: 'all' })
    setShowAddUser(false)
  }

  const handleFinishWizard = async () => {
    if (!business) return
    setIsSaving(true)
    try {
      // 1. Update Business
      await patchBusiness(business.id, {
        rubro: selectedRubroId,
        stockMode: branches[0].stockMode, // Use main branch as default
        tieneMultiplesSucursales: isMultiBranch,
        branches: branches.map(b => ({ id: b.id, name: b.name, address: b.address }))
      })
      setBusiness({ 
        ...business, 
        rubro: selectedRubroId, 
        stockMode: branches[0].stockMode,
        tieneMultiplesSucursales: isMultiBranch,
        branches: branches.map(b => ({ id: b.id, name: b.name, address: b.address }))
      })

      // 2. Create Products (Simulated per branch logic since backend might not support branchId on product yet)
      // We will create products for the business. If multi-branch support is strictly needed in backend, 
      // we'd need to send branchId. For now, we assume global products or main branch.
      // We'll process all unique products from all branches.
      
      let allProducts: TemplateItem[] = []
      branches.forEach(b => {
        allProducts = [...allProducts, ...b.products]
      })
      
      // De-duplicate by name for simplicity if backend is single-list
      const uniqueProducts = Array.from(new Set(allProducts.map(p => p.nombre)))
        .map(name => allProducts.find(p => p.nombre === name)!)

      let successCount = 0
      for (const item of uniqueProducts) {
        if (!item.nombre) continue
        try {
          await createProduct({
            businessId: business.id,
            nombre: item.nombre,
            categoria: item.categoria,
            unidad: item.unidad,
            priceCents: item.priceCents,
            costCents: item.costCents,
            stock: item.stock,
            trackStock: item.trackStock,
            disponible: item.disponible,
            imageUrl: item.imageUrl,
            isIngredient: item.isIngredient,
            recipe: item.recipe as any
          })
          successCount++
        } catch (e) {
          console.error(`Error creating product ${item.nombre}:`, e)
        }
      }

      // 3. Create Users (Mocked for now as we don't have createAccount endpoint exposed here fully working with branch)
      // In a real app, we would call createAccount for each team member.
      
      showToast(`Configuración guardada. ${successCount} productos creados.`, 'success')
      setStep('SUCCESS')
    } catch (e) {
      console.error(e)
      showToast('Error al guardar la configuración', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0]
  const filteredProducts = activeBranch.products.filter(p => 
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddExistingUserToBranch = async () => {
    if (!business || !selectedExistingUser) {
      showToast('Seleccioná un usuario', 'error')
      return
    }

    setIsSaving(true)
    try {
      // Find the user to update
      const user = accounts.find(a => String(a.id) === selectedExistingUser)
      if (!user) throw new Error('Usuario no encontrado')

      const targetBranchId = newUser.branchId || 'main'
      
      // Logic for multi-branch assignment
      // If target is 'all', we set branchId='all' and clear branchIds
      // If target is specific, we append to branchIds (if not 'all' already)
      
      const updateData: Partial<AccountAdminRecord> = {}
      
      if (targetBranchId === 'all') {
        updateData.branchId = 'all'
        updateData.branchIds = [] 
      } else {
        if (user.branchId === 'all') {
           showToast('Este usuario ya tiene acceso global', 'info')
           setIsSaving(false)
           return
        }

        const currentBranchIds = user.branchIds || []
        // Ensure current branchId is in the list if it wasn't
        if (user.branchId && user.branchId !== 'all' && !currentBranchIds.includes(user.branchId)) {
           currentBranchIds.push(user.branchId)
        }
        
        // Add new branch if not present
        if (!currentBranchIds.includes(targetBranchId)) {
           currentBranchIds.push(targetBranchId)
        }
        
        updateData.branchIds = currentBranchIds
        // Ensure branchId is set to something valid (e.g. the target one if it was null)
        if (!user.branchId) {
          updateData.branchId = targetBranchId
        }
      }

      await updateAccount(user.id, updateData)

      showToast(`Usuario ${user.nombre} asignado correctamente`, 'success')
      setShowAddUser(false)
      setNewUser({ role: 'vendedor', branchId: 'all' })
      setSelectedExistingUser('')
      setIsAddingExistingUser(false)
      void loadAccounts()
    } catch (e) {
      showToast('Error al asignar usuario', 'error')
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImpersonateUser = (targetAccount: AccountAdminRecord) => {
    useAuthStore.setState({ 
      account: {
        id: targetAccount.id,
        businessId: targetAccount.businessId,
        branchId: targetAccount.branchId,
        nombre: targetAccount.nombre,
        email: targetAccount.email,
        rol: targetAccount.rol as any
      }
    })
    // Force reload or navigation
    window.location.href = '/app/pedidos'
  }

  // --- RENDER HELPERS ---
  const renderMascot = (message: string, mood: 'happy' | 'excited' | 'thinking' = 'happy') => (
    <div className="flex items-start gap-4 p-4 rounded-[var(--radius)] bg-blue-500/10 border border-blue-500/20 mb-8 max-w-3xl mx-auto animate-in slide-in-from-top-4">
      <div className="flex-shrink-0 bg-blue-500 text-white p-3 rounded-[calc(var(--radius)_-_8px)] shadow-lg transform -rotate-3">
        <Smile className="h-8 w-8" />
      </div>
      <div className="pt-1">
        <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-1">Asistente Gestly</h3>
        <p className="text-sm text-blue-900/80 dark:text-blue-100/80 leading-relaxed">{message}</p>
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-2 text-sm tracking-tight text-[color:var(--muted)]">Personalizá tu experiencia en Gestly.</p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex w-fit min-w-full gap-2 rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-1 md:min-w-0">
          <button
            type="button"
            onClick={() => setActiveTab('asistente')}
            className={[
              'rounded-[var(--radius)] px-6 py-2 text-sm font-medium tracking-tight',
              activeTab === 'asistente'
                ? 'bg-[color:var(--outline-bg)] text-[color:var(--text)] shadow-[0_10px_30px_var(--shadow)]'
                : 'text-[color:var(--muted)] hover:bg-[color:var(--ghost-hover-bg)] hover:text-[color:var(--text)]',
            ].join(' ')}
          >
            <span className="inline-flex items-center gap-2">
              <Smile className="h-4 w-4" strokeWidth={1.5} />
              Asistente
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('negocio')}
            className={[
              'rounded-[var(--radius)] px-6 py-2 text-sm font-medium tracking-tight',
              activeTab === 'negocio'
                ? 'bg-[color:var(--outline-bg)] text-[color:var(--text)] shadow-[0_10px_30px_var(--shadow)]'
                : 'text-[color:var(--muted)] hover:bg-[color:var(--ghost-hover-bg)] hover:text-[color:var(--text)]',
            ].join(' ')}
          >
            <span className="inline-flex items-center gap-2">
              <Settings className="h-4 w-4" strokeWidth={1.5} />
              Negocio
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('usuarios')}
            className={[
              'rounded-[var(--radius)] px-6 py-2 text-sm font-medium tracking-tight',
              activeTab === 'usuarios'
                ? 'bg-[color:var(--outline-bg)] text-[color:var(--text)] shadow-[0_10px_30px_var(--shadow)]'
                : 'text-[color:var(--muted)] hover:bg-[color:var(--ghost-hover-bg)] hover:text-[color:var(--text)]',
            ].join(' ')}
          >
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4" strokeWidth={1.5} />
              Equipo y Sucursales
            </span>
          </button>
        </div>
      </div>

      {/* --- TAB: ASISTENTE --- */}
      {activeTab === 'asistente' && (
        <div className="animate-slide-in-up">
          {activeMission === 'NONE' && (
            <div className="max-w-4xl mx-auto">
              {renderMascot("¡Hola! Soy tu asistente personal. Estoy acá para ayudarte a configurar tu negocio y enseñarte a usar todas las herramientas. ¿Por dónde querés empezar hoy?", 'happy')}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => { setActiveMission('SETUP'); setStep('STRUCTURE'); }}
                  className="group relative overflow-hidden rounded-[var(--radius)] bg-[color:var(--card-bg)] border border-[color:var(--border)] p-6 text-left transition-all hover:shadow-lg hover:scale-[1.01]"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Store className="h-24 w-24 text-[color:var(--primary-bg)]" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 text-white shadow-md">
                      <Settings className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Configuración Inicial</h3>
                    <p className="text-sm text-[color:var(--muted)] mb-4">Estructura del negocio, sucursales, productos y equipo de trabajo.</p>
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-full">
                      Comenzar <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </button>

                <div className="space-y-4">
                  <div className="rounded-3xl bg-[color:var(--card-bg)] border border-[color:var(--border)] p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 flex-shrink-0">
                        <ShoppingBasket className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">¿Cómo hacer una venta?</h4>
                        <p className="text-xs text-[color:var(--muted)] mt-1 mb-3">Aprendé a cargar pedidos y cobrar.</p>
                        <Button variant="ghost" size="sm" className="h-8 text-xs -ml-2" onClick={() => window.location.href = '/'}>
                          Ir a Caja <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-[color:var(--card-bg)] border border-[color:var(--border)] p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Gestionar Fiados</h4>
                        <p className="text-xs text-[color:var(--muted)] mt-1 mb-3">Registrá deudas y pagos de clientes.</p>
                        <Button variant="ghost" size="sm" className="h-8 text-xs -ml-2" onClick={() => window.location.href = '/ventas'}>
                          Ver Ventas <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMission === 'SETUP' && (
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <Button variant="ghost" onClick={() => setActiveMission('NONE')} className="gap-2 text-[color:var(--muted)] hover:text-[color:var(--text)]">
                  <ArrowLeft className="h-4 w-4" /> Volver al menú del asistente
                </Button>
              </div>

              {/* Wizard Progress */}
              <div className="mb-8 overflow-x-auto pb-2">
                <div className="flex items-center justify-center min-w-max">
                  {['Estructura', 'Rubro', 'Stock', 'Plantilla', 'Personalizar', 'Equipo'].map((s, i) => {
                    const stepMap: Record<string, WizardStep> = {
                      'Estructura': 'STRUCTURE', 'Rubro': 'RUBRO', 'Stock': 'STOCK_MODE', 
                      'Plantilla': 'TEMPLATE', 'Personalizar': 'CUSTOMIZE', 'Equipo': 'TEAM'
                    }
                    const currentStepIdx = Object.keys(stepMap).indexOf(Object.keys(stepMap).find(k => stepMap[k] === step) || '')
                    const isActive = i <= currentStepIdx
                    return (
                      <div key={s} className="flex items-center">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${isActive ? 'bg-[color:var(--primary-bg)] text-white border-transparent' : 'bg-[color:var(--card-bg)] border-[color:var(--border)] text-[color:var(--muted)]'}`}>
                          {i + 1}. {s}
                        </div>
                        {i < 5 && <ArrowRight className="h-3 w-3 text-[color:var(--muted)] mx-2" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* STEP 1: STRUCTURE (Single vs Multi) */}
              {step === 'STRUCTURE' && (
                <div className="space-y-6">
                  {renderMascot("Empecemos por lo básico. ¿Tu negocio tiene un solo local o administrás varias sucursales?", 'thinking')}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <button
                      onClick={() => handleStructureSelect(false)}
                      className={`relative p-8 rounded-[var(--radius)] border text-left transition-all ${!isMultiBranch ? 'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)]/5 ring-1 ring-[color:var(--primary-bg)]' : 'border-[color:var(--border)] hover:bg-[color:var(--ghost-hover-bg)]'}`}
                    >
                      <div className="p-3 rounded-[calc(var(--radius)-8px)] bg-[color:var(--outline-bg)] w-fit mb-4">
                        <Store className="h-8 w-8 text-[color:var(--text)]" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Un solo local</h3>
                      <p className="text-sm text-[color:var(--muted)]">Gestioná todo tu inventario y ventas en un único lugar. Ideal para empezar.</p>
                    </button>

                    <button
                      onClick={() => handleStructureSelect(true)}
                      className={`relative p-8 rounded-[var(--radius)] border text-left transition-all ${isMultiBranch ? 'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)]/5 ring-1 ring-[color:var(--primary-bg)]' : 'border-[color:var(--border)] hover:bg-[color:var(--ghost-hover-bg)]'}`}
                    >
                      <div className="p-3 rounded-[calc(var(--radius)-8px)] bg-[color:var(--outline-bg)] w-fit mb-4">
                        <Building2 className="h-8 w-8 text-[color:var(--text)]" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Múltiples sucursales</h3>
                      <p className="text-sm text-[color:var(--muted)]">Controlá varios locales, depósitos o franquicias desde una sola cuenta maestra.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 1.5: BRANCHES SETUP (If Multi) */}
              {step === 'BRANCHES' && (
                <div className="space-y-6">
                  {renderMascot("¡Genial! Vamos a registrar tus sucursales. Podés agregar todas las que necesites.", 'excited')}
                  
                  <div className="max-w-2xl mx-auto space-y-4">
                    {branches.map((branch, idx) => (
                      <div key={branch.id} className="flex gap-4 items-start p-4 rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)]">
                        <div className="p-2 rounded-[calc(var(--radius)-8px)] bg-[color:var(--outline-bg)] mt-1">
                          <Store className="h-5 w-5 text-[color:var(--muted)]" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-[color:var(--muted)]">Nombre de la Sucursal</label>
                            <Input 
                              value={branch.name} 
                              onChange={(e) => {
                                const newBranches = [...branches]
                                newBranches[idx].name = e.target.value
                                setBranches(newBranches)
                              }}
                              placeholder="Ej. Centro, Norte, Depósito..."
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-[color:var(--muted)]">Dirección (Opcional)</label>
                            <Input 
                              value={branch.address} 
                              onChange={(e) => {
                                const newBranches = [...branches]
                                newBranches[idx].address = e.target.value
                                setBranches(newBranches)
                              }}
                              placeholder="Calle 123..."
                            />
                          </div>
                        </div>
                        {branches.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => {
                            const newBranches = branches.filter(b => b.id !== branch.id)
                            setBranches(newBranches)
                          }}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    <Button variant="outline" onClick={handleAddBranch} className="w-full border-dashed">
                      <Plus className="h-4 w-4 mr-2" /> Agregar otra sucursal
                    </Button>

                    <div className="flex justify-between pt-6">
                      <Button variant="ghost" onClick={() => setStep('STRUCTURE')}>Atrás</Button>
                      <Button onClick={handleBranchesConfirm}>Continuar <ArrowRight className="h-4 w-4 ml-2" /></Button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: RUBRO */}
              {step === 'RUBRO' && (
                <div className="space-y-6">
                  {renderMascot("Ahora contame, ¿a qué rubro se dedica tu negocio?", 'thinking')}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {RUBROS.map((rubro, idx) => {
                      const Icon = ICON_MAP[rubro.icon] || Store
                      const isSelected = selectedRubroId === rubro.id
                      const gradients = [
                        'from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30',
                        'from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/30',
                        'from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-800/30',
                        'from-amber-500/10 to-amber-600/5 border-amber-200/50 dark:border-amber-800/30',
                        'from-rose-500/10 to-rose-600/5 border-rose-200/50 dark:border-rose-800/30',
                        'from-cyan-500/10 to-cyan-600/5 border-cyan-200/50 dark:border-cyan-800/30',
                        'from-indigo-500/10 to-indigo-600/5 border-indigo-200/50 dark:border-indigo-800/30',
                      ]
                      const gradientClass = gradients[idx % gradients.length]
                      
                      return (
                        <button
                          key={rubro.id}
                          type="button"
                          onClick={() => handleRubroSelect(rubro.id)}
                          className={`relative overflow-hidden rounded-[calc(var(--radius)_-_4px)] border p-6 text-left transition-all duration-300 hover:scale-[1.02] ${isSelected ? `ring-2 ring-[color:var(--primary-bg)] shadow-lg bg-gradient-to-br ${gradientClass}` : 'hover:shadow-md hover:bg-[color:var(--ghost-hover-bg)] bg-[color:var(--card-bg)] border-[color:var(--border)]'}`}
                        >
                          <div className="flex flex-col gap-4 relative z-10">
                            <div className={`w-14 h-14 rounded-[calc(var(--radius)-4px)] flex items-center justify-center shadow-sm transition-colors ${isSelected ? 'bg-white/80 dark:bg-black/20' : 'bg-[color:var(--outline-bg)]'}`}>
                              <Icon className={`h-7 w-7 ${isSelected ? 'text-[color:var(--text)]' : 'text-[color:var(--muted)]'}`} strokeWidth={1.5} />
                            </div>
                            <div>
                              <div className="font-bold text-lg tracking-tight mb-1">{rubro.name}</div>
                              <div className="text-sm font-medium text-[color:var(--muted)]">
                                {rubro.templates.length} plantillas disponibles
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: STOCK MODE */}
              {step === 'STOCK_MODE' && (
                <div className="space-y-6">
                  {renderMascot("¿Cómo querés controlar tu stock?", 'thinking')}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <button
                      type="button"
                      onClick={() => handleStockModeSelect('complete')}
                      className={`relative p-8 rounded-[--radius] border text-left transition-all ${branches[0].stockMode === 'complete' ? 'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)]/5 ring-1 ring-[color:var(--primary-bg)]' : 'border-[color:var(--border)] hover:bg-[color:var(--ghost-hover-bg)]'}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-[calc(var(--radius)-4px)] bg-[color:var(--primary-bg)]/10 text-[color:var(--primary-bg)]">
                          <Package className="h-8 w-8" />
                        </div>
                      </div>
                      <div className="text-xl font-bold mb-2">Control Completo</div>
                      <div className="text-sm text-[color:var(--muted)] leading-relaxed">
                        Control de cantidades exactas, costos y reportes de ganancia.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStockModeSelect('simple')}
                      className={`relative p-8 rounded-[var(--radius)] border text-left transition-all ${branches[0].stockMode === 'simple' ? 'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)]/5 ring-1 ring-[color:var(--primary-bg)]' : 'border-[color:var(--border)] hover:bg-[color:var(--ghost-hover-bg)]'}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-[calc(var(--radius)-8px)] bg-[color:var(--outline-bg)] text-[color:var(--text)]">
                          <CheckCircle className="h-8 w-8" />
                        </div>
                      </div>
                      <div className="text-xl font-bold mb-2">Disponibilidad Simple</div>
                      <div className="text-sm text-[color:var(--muted)] leading-relaxed">
                        Solo "Disponible" o "Agotado". Sin conteo de unidades.
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: TEMPLATE */}
              {step === 'TEMPLATE' && (
                <div className="space-y-6">
                  {renderMascot("Elegí una plantilla de productos para empezar rápido.", 'happy')}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <button
                      onClick={() => handleTemplateSelect(null)}
                      className="group relative overflow-hidden rounded-[var(--radius)] border border-dashed border-[color:var(--border)] bg-transparent p-8 text-left transition-all hover:bg-[color:var(--ghost-hover-bg)] hover:border-[color:var(--primary-bg)]"
                    >
                      <div className="flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[color:var(--outline-bg)] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="h-8 w-8 text-[color:var(--muted)]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">Empezar de Cero</h3>
                          <p className="text-sm text-[color:var(--muted)] mt-1">
                            Creá tu catálogo producto por producto.
                          </p>
                        </div>
                      </div>
                    </button>

                    {RUBROS.find(r => r.id === selectedRubroId)?.templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="group relative overflow-hidden rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-8 text-left transition-all hover:shadow-xl hover:scale-[1.02]"
                      >
                        <div className="absolute top-0 right-0 bg-[color:var(--primary-bg)]/10 text-[color:var(--primary-bg)] px-4 py-1 rounded-bl-[calc(var(--radius)-8px)] text-xs font-bold uppercase tracking-wider">
                          Recomendado
                        </div>
                        <div className="flex flex-col gap-4">
                          <div className="w-16 h-16 rounded-[calc(var(--radius)-8px)] bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                            <Package className="h-8 w-8 text-[color:var(--primary-bg)]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{template.name}</h3>
                            <p className="text-sm text-[color:var(--muted)] mt-1 mb-4">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-medium bg-[color:var(--outline-bg)] w-fit px-3 py-1.5 rounded-full">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {template.items.length} productos incluidos
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: CUSTOMIZE (Multi-branch supported) */}
              {step === 'CUSTOMIZE' && (
                <div className="space-y-6">
                  {renderMascot("Personalizá tus productos. Si tenés varias sucursales, podés configurar el stock de cada una por separado.", 'excited')}
                  
                  {isMultiBranch && (
                    <div className="flex overflow-x-auto gap-2 pb-2">
                      {branches.map(branch => (
                        <button
                          key={branch.id}
                          onClick={() => setActiveBranchId(branch.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-[calc(var(--radius)-8px)] border font-medium whitespace-nowrap transition-all ${activeBranchId === branch.id ? 'bg-[color:var(--primary-bg)] text-white border-transparent' : 'bg-[color:var(--card-bg)] border-[color:var(--border)] text-[color:var(--muted)]'}`}
                        >
                          <Store className="h-4 w-4" />
                          {branch.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 bg-[color:var(--card-bg)] p-4 rounded-[var(--radius)] border border-[color:var(--border)] shadow-sm">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted)]" />
                      <input
                        type="text"
                        placeholder={`Buscar en ${activeBranch.name}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none outline-none pl-9 text-sm"
                      />
                    </div>
                    <div className="h-6 w-px bg-[color:var(--border)]" />
                    <Button variant="ghost" size="sm" onClick={handleAddProduct} className="gap-2 text-[color:var(--primary-bg)]">
                      <Plus className="h-4 w-4" />
                      Agregar
                    </Button>
                  </div>

                  <div className="bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-[var(--radius)] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[color:var(--border)] bg-[color:var(--outline-bg)]/50">
                            <th className="text-left py-3 px-4 font-medium text-[color:var(--muted)]">Nombre</th>
                            <th className="text-left py-3 px-4 font-medium text-[color:var(--muted)]">Categoría</th>
                            <th className="text-right py-3 px-4 font-medium text-[color:var(--muted)]">Precio ($)</th>
                            <th className="text-right py-3 px-4 font-medium text-[color:var(--muted)]">Stock</th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[color:var(--border)]">
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-[color:var(--muted)]">
                                No hay productos en esta sucursal.
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((product, idx) => {
                              const realIndex = activeBranch.products.indexOf(product)
                              return (
                                <tr key={idx} className="group hover:bg-[color:var(--ghost-hover-bg)]">
                                  <td className="p-2">
                                    <Input 
                                      value={product.nombre} 
                                      onChange={(e) => handleProductChange(realIndex, 'nombre', e.target.value)}
                                      className="h-9 bg-transparent border-transparent hover:border-[color:var(--border)] focus:border-[color:var(--primary-bg)]"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input 
                                      value={product.categoria} 
                                      onChange={(e) => handleProductChange(realIndex, 'categoria', e.target.value)}
                                      className="h-9 bg-transparent border-transparent hover:border-[color:var(--border)] focus:border-[color:var(--primary-bg)] w-32"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input 
                                      type="number"
                                      value={product.priceCents / 100} 
                                      onChange={(e) => handleProductChange(realIndex, 'priceCents', parseFloat(e.target.value || '0') * 100)}
                                      className="h-9 pl-6 text-right bg-transparent border-transparent hover:border-[color:var(--border)] focus:border-[color:var(--primary-bg)]"
                                    />
                                  </td>
                                  <td className="p-2">
                                    {activeBranch.stockMode === 'complete' ? (
                                      <Input 
                                        type="number"
                                        value={product.stock || ''} 
                                        onChange={(e) => handleProductChange(realIndex, 'stock', parseInt(e.target.value || '0'))}
                                        className="h-9 text-right bg-transparent border-transparent hover:border-[color:var(--border)] focus:border-[color:var(--primary-bg)] w-20 ml-auto"
                                        placeholder="-"
                                      />
                                    ) : (
                                      <div className="flex justify-end text-xs text-[color:var(--muted)] px-3">N/A</div>
                                    )}
                                  </td>
                                  <td className="p-2 text-center">
                                    <button 
                                      onClick={() => handleRemoveProduct(realIndex)}
                                      className="p-2 rounded-lg text-[color:var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={() => setStep('TEMPLATE')}>Atrás</Button>
                    <Button onClick={() => setStep('TEAM')}>Siguiente: Equipo <ArrowRight className="h-4 w-4 ml-2" /></Button>
                  </div>
                </div>
              )}

              {/* STEP 6: TEAM (New) */}
              {step === 'TEAM' && (
                <div className="space-y-6">
                  {renderMascot("Por último, ¿trabajás con más personas? Agregá a tus empleados y asignales permisos.", 'happy')}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Add User Card */}
                    <div className="rounded-[var(--radius)] border border-[color:var(--border)] border-dashed bg-[color:var(--card-bg)]/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[color:var(--card-bg)] transition-colors" onClick={() => setShowAddUser(true)}>
                      <div className="w-12 h-12 rounded-full bg-[color:var(--outline-bg)] flex items-center justify-center mb-3">
                        <UserPlus className="h-6 w-6 text-[color:var(--primary-bg)]" />
                      </div>
                      <h3 className="font-bold text-sm">Agregar Usuario</h3>
                      <p className="text-xs text-[color:var(--muted)] mt-1">Crear cuenta para empleado</p>
                    </div>

                    {/* Team List */}
                    {teamMembers.map(member => (
                      <div key={member.id} className="rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-6 relative group">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setTeamMembers(teamMembers.filter(m => m.id !== member.id))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{member.name}</h4>
                            <p className="text-xs text-[color:var(--muted)]">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 rounded-md bg-[color:var(--outline-bg)] text-xs font-medium capitalize">
                            {member.role}
                          </span>
                          <span className="px-2 py-1 rounded-md bg-[color:var(--outline-bg)] text-xs font-medium flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            {member.branchId === 'all' ? 'Todas' : branches.find(b => b.id === member.branchId)?.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {showAddUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
                      <div className="bg-[color:var(--card-bg)] rounded-[var(--radius)] p-6 w-full max-w-md space-y-4 shadow-2xl">
                        <h3 className="font-bold text-lg">Nuevo Usuario</h3>
                        <div className="space-y-3">
                          <Input placeholder="Nombre" value={newUser.name || ''} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                          <Input placeholder="Email / Usuario" value={newUser.email || ''} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                          <Input type="password" placeholder="Contraseña" value={newUser.password || ''} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-[color:var(--muted)] ml-1">Rol</label>
                              <Select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                                <option value="vendedor">Vendedor</option>
                                <option value="gerente">Gerente</option>
                                <option value="admin">Admin</option>
                              </Select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-[color:var(--muted)] ml-1">Sucursal</label>
                              <Select value={newUser.branchId} onChange={e => setNewUser({...newUser, branchId: e.target.value})}>
                                <option value="all">Todas</option>
                                {branches.map(b => (
                                  <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button variant="ghost" className="flex-1" onClick={() => setShowAddUser(false)}>Cancelar</Button>
                          <Button className="flex-1" onClick={handleAddUser}>Guardar</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-6 border-t border-[color:var(--border)]">
                    <Button variant="ghost" onClick={() => setStep('CUSTOMIZE')}>Atrás</Button>
                    <Button onClick={handleFinishWizard} disabled={isSaving} className="gap-2 bg-[color:var(--primary-bg)] text-white hover:opacity-90">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Finalizar Todo
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP: SUCCESS */}
              {step === 'SUCCESS' && (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">¡Todo Listo!</h2>
                    <p className="text-[color:var(--muted)] mt-2 max-w-md mx-auto">
                      Tu negocio, sucursales, productos y equipo han sido configurados exitosamente.
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/'} 
                    className="h-12 px-8 rounded-[var(--radius)] bg-[color:var(--primary-bg)] text-white hover:opacity-90 text-lg shadow-lg shadow-[color:var(--primary-bg)]/20"
                  >
                    Ir al Dashboard
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- TAB: NEGOCIO --- */}
      {activeTab === 'negocio' && (
        <div className="animate-slide-in-up max-w-2xl mx-auto space-y-6">
          <div className="rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-[color:var(--primary-bg)]" />
              Información del Negocio
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[color:var(--muted)]">Nombre del Negocio</label>
                <Input 
                  value={business?.nombre || ''} 
                  onChange={(e) => setBusiness({ nombre: e.target.value })}
                  placeholder="Ej. Mi Tienda"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[color:var(--muted)]">Ubicación / Dirección</label>
                <Input 
                  value={business?.ubicacion || ''} 
                  onChange={(e) => setBusiness({ ubicacion: e.target.value })}
                  placeholder="Ej. Av. Siempre Viva 123"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[color:var(--muted)]">Rubro</label>
                  <Select 
                    value={business?.rubro || 'general'} 
                    onChange={(e) => setBusiness({ rubro: e.target.value })}
                  >
                    {RUBROS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[color:var(--muted)]">Modo de Stock</label>
                  <Select 
                    value={business?.stockMode || 'simple'} 
                    onChange={(e) => setBusiness({ stockMode: e.target.value as any })}
                  >
                    <option value="simple">Simple (Disponible/Agotado)</option>
                    <option value="complete">Completo (Cantidades y Costos)</option>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={async () => {
                  if (!business) return
                  try {
                    await patchBusiness(business.id, {
                      nombre: business.nombre,
                      ubicacion: business.ubicacion,
                      rubro: business.rubro,
                      stockMode: business.stockMode
                    })
                    showToast('Información actualizada', 'success')
                  } catch {
                    showToast('Error al actualizar', 'error')
                  }
                }}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>

          <div className="rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[color:var(--primary-bg)]" />
              Estructura
            </h2>
            <div className="flex items-center justify-between p-4 rounded-[calc(var(--radius)-8px)] bg-[color:var(--outline-bg)]/50 border border-[color:var(--border)]">
              <div>
                <div className="font-medium">Multi-sucursal</div>
                <div className="text-xs text-[color:var(--muted)]">
                  {business?.tieneMultiplesSucursales ? 'Activado' : 'Desactivado'}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setActiveTab('asistente')
                  setActiveMission('SETUP')
                  setStep('STRUCTURE')
                }}
              >
                Configurar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: USUARIOS --- */}
      {activeTab === 'usuarios' && (
        <div className="animate-slide-in-up space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Gestión de Equipo y Sucursales</h2>
              <p className="text-sm text-[color:var(--muted)]">Administrá tus sucursales y el personal asignado a cada una.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddBranch} variant="outline" className="shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Sucursal
              </Button>
              <Button onClick={() => setShowAddUser(true)} className="shadow-lg shadow-[color:var(--primary-bg)]/20">
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          {accountsStatus === 'loading' && (
             <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[color:var(--primary-bg)]" /></div>
          )}

          {accountsStatus === 'success' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
               {/* Global Users (Admins usually or Multi-branch access) */}
               {accounts.some(a => !a.branchId || a.branchId === 'all') && (
                 <div className="rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-1 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[color:var(--border)] bg-[color:var(--outline-bg)]/30 flex items-center gap-2">
                       <Shield className="h-4 w-4 text-purple-500" />
                       <span className="font-bold text-sm">Acceso Global</span>
                       <span className="ml-auto text-xs font-medium bg-[color:var(--card-bg)] px-2 py-0.5 rounded-full border border-[color:var(--border)]">
                         {accounts.filter(a => !a.branchId || a.branchId === 'all').length}
                       </span>
                    </div>
                    <div className="p-2 space-y-1">
                       {accounts.filter(a => !a.branchId || a.branchId === 'all').map(a => (
                         <div key={a.id} className="group flex items-center gap-3 p-3 rounded-[calc(var(--radius)-8px)] hover:bg-[color:var(--ghost-hover-bg)] transition-colors">
                            <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-sm">
                               {a.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                               <div className="font-semibold text-sm truncate">{a.nombre}</div>
                               <div className="text-xs text-[color:var(--muted)] truncate">{a.email}</div>
                            </div>
                            <div className="px-2 py-1 rounded-lg bg-[color:var(--outline-bg)] text-[10px] font-bold uppercase tracking-wider">
                               {a.rol}
                            </div>
                            <button
                              onClick={() => handleImpersonateUser(a)}
                              className="ml-auto p-2 rounded-full hover:bg-[color:var(--primary-bg)]/10 text-[color:var(--muted)] hover:text-[color:var(--primary-bg)] transition-colors opacity-0 group-hover:opacity-100"
                              title="Ver como este usuario"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* Branch Specific Users */}
               {branches.map(branch => {
                 const branchUsers = accounts.filter(a => a.branchId === branch.id || (a.branchIds && a.branchIds.includes(branch.id)))
                 if (branchUsers.length === 0 && !isMultiBranch && !accounts.some(a => !a.branchId || a.branchId === 'all')) return null 
                 
                 return (
                  <div key={branch.id} className="rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-1 shadow-sm overflow-hidden flex flex-col group/card">
                     <div className="p-4 border-b border-[color:var(--border)] bg-[color:var(--outline-bg)]/30 flex items-center gap-2 relative">
                        <Store className="h-4 w-4 text-[color:var(--primary-bg)]" />
                        <Input 
                          value={branch.name} 
                          onChange={(e) => handleUpdateBranch(branch.id, { name: e.target.value })}
                          className="font-bold text-sm bg-transparent border-transparent hover:border-[color:var(--border)] focus:border-[color:var(--primary-bg)] h-7 px-1 w-full max-w-[150px]"
                        />
                        <span className="ml-auto text-xs font-medium bg-[color:var(--card-bg)] px-2 py-0.5 rounded-full border border-[color:var(--border)]">
                          {branchUsers.length}
                        </span>
                        {branches.length > 1 && (
                          <button 
                            onClick={() => handleDeleteBranch(branch.id)}
                            className="absolute right-2 top-2 p-1.5 rounded-full bg-red-500/10 text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-500/20"
                            title="Eliminar sucursal"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                     </div>
                     <div className="p-2 space-y-1 min-h-[100px]">
                         {branchUsers.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-[color:var(--muted)] text-xs py-8">
                              <UserPlus className="h-8 w-8 opacity-20 mb-2" />
                              Sin usuarios asignados
                           </div>
                         ) : (
                           branchUsers.map(a => (
                             <div key={a.id} className="group flex items-center gap-3 p-3 rounded-[calc(var(--radius)-8px)] hover:bg-[color:var(--ghost-hover-bg)] transition-colors">
                                <div className="h-10 w-10 rounded-full bg-[color:var(--primary-bg)]/10 text-[color:var(--primary-bg)] flex items-center justify-center font-bold text-sm">
                                   {a.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                   <div className="font-semibold text-sm truncate">{a.nombre}</div>
                                   <div className="text-xs text-[color:var(--muted)] truncate">{a.email}</div>
                                </div>
                                <div className="px-2 py-1 rounded-lg bg-[color:var(--outline-bg)] text-[10px] font-bold uppercase tracking-wider">
                                   {a.rol}
                                </div>
                                <button
                                  onClick={() => handleImpersonateUser(a)}
                                  className="ml-auto p-2 rounded-full hover:bg-[color:var(--primary-bg)]/10 text-[color:var(--muted)] hover:text-[color:var(--primary-bg)] transition-colors opacity-0 group-hover:opacity-100"
                                  title="Ver como este usuario"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                             </div>
                           ))
                         )}
                      </div>
                      <div className="p-2 pt-0">
                        <Button 
                          variant="ghost" 
                          className="w-full text-xs h-8 text-[color:var(--muted)] hover:text-[color:var(--primary-bg)]"
                          onClick={() => {
                            setNewUser({ ...newUser, branchId: branch.id })
                            setShowAddUser(true)
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1.5" /> Agregar a esta sucursal
                        </Button>
                      </div>
                   </div>
                 )
               })}
            </div>
          )}

          {/* Add User Modal */}
          {showAddUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-[color:var(--card-bg)] rounded-[var(--radius)] p-6 w-full max-w-md space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-[color:var(--border)]">
                <div className="flex items-center justify-between">
                   <h3 className="font-bold text-xl">{isAddingExistingUser ? 'Asignar Usuario Existente' : 'Nuevo Usuario'}</h3>
                   <button onClick={() => { setShowAddUser(false); setIsAddingExistingUser(false); }} className="p-2 rounded-full hover:bg-[color:var(--ghost-hover-bg)]">
                     <X className="h-5 w-5" />
                   </button>
                </div>
                
                {!isAddingExistingUser ? (
                  <>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[color:var(--outline-bg)] border border-[color:var(--border)] mb-4">
                        <p className="text-sm font-medium mb-2">¿Querés asignar un usuario que ya existe?</p>
                        <Button variant="outline" size="sm" onClick={() => setIsAddingExistingUser(true)} className="w-full">
                          <Users className="h-4 w-4 mr-2" />
                          Seleccionar de la lista
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)] ml-1">Información Personal</label>
                        <div className="grid gap-3">
                          <Input 
                            placeholder="Nombre completo" 
                            value={newUser.name || ''} 
                            onChange={e => setNewUser({...newUser, name: e.target.value})} 
                            className="rounded-xl h-11"
                            autoFocus
                          />
                          <Input 
                            placeholder="Correo electrónico" 
                            value={newUser.email || ''} 
                            onChange={e => setNewUser({...newUser, email: e.target.value})} 
                            className="rounded-xl h-11"
                          />
                          <Input 
                            type="password" 
                            placeholder="Contraseña" 
                            value={newUser.password || ''} 
                            onChange={e => setNewUser({...newUser, password: e.target.value})} 
                            className="rounded-xl h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)] ml-1">Permisos</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-[color:var(--muted)] mb-1.5 block">Rol</label>
                            <Select 
                              value={newUser.role} 
                              onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                              className="rounded-xl h-11"
                            >
                              <option value="vendedor">Vendedor</option>
                              <option value="gerente">Gerente</option>
                              <option value="admin">Administrador</option>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-[color:var(--muted)] mb-1.5 block">Asignar a</label>
                            <Select 
                              value={newUser.branchId} 
                              onChange={e => setNewUser({...newUser, branchId: e.target.value})}
                              className="rounded-xl h-11"
                              disabled={!isMultiBranch}
                            >
                              {isMultiBranch && <option value="all">Todas (Global)</option>}
                              {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button variant="ghost" className="flex-1 h-12 rounded-xl font-medium" onClick={() => setShowAddUser(false)}>Cancelar</Button>
                      <Button className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-[color:var(--primary-bg)]/20" onClick={handleCreateEmployee} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Crear Cuenta'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)] ml-1">Usuario</label>
                        <Select 
                          value={selectedExistingUser}
                          onChange={(e) => setSelectedExistingUser(e.target.value)}
                          className="rounded-xl h-11"
                        >
                          <option value="">Seleccionar usuario...</option>
                          {accounts
                            .filter(a => a.rol !== 'admin' || a.id !== accounts.find(acc => acc.rol === 'admin')?.id) // Filter out main admin if needed or just show all
                            .map(a => (
                            <option key={a.id} value={a.id}>{a.nombre} ({a.email})</option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)] ml-1">Asignar a Sucursal</label>
                        <Select 
                          value={newUser.branchId} 
                          onChange={e => setNewUser({...newUser, branchId: e.target.value})}
                          className="rounded-xl h-11"
                        >
                          {isMultiBranch && <option value="all">Todas (Global)</option>}
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button variant="ghost" className="flex-1 h-12 rounded-xl font-medium" onClick={() => setIsAddingExistingUser(false)}>Volver</Button>
                      <Button className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-[color:var(--primary-bg)]/20" onClick={handleAddExistingUserToBranch} disabled={!selectedExistingUser || isSaving}>
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Asignar'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
