import { ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCartStore } from '@shared/stores/cartStore'
import { useUiStore } from '@shared/stores/uiStore'

export function CartFab() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const items = useCartStore((s) => s.items)
  const isCartOpen = useUiStore((s) => s.isCartOpen)
  const setIsCartOpen = useUiStore((s) => s.setIsCartOpen)
  
  const [isBumped, setIsBumped] = useState(false)
  const [prevCount, setPrevCount] = useState(0)

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalCents = items.reduce((acc, item) => acc + item.priceCents * item.quantity, 0)
  
  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`

  // Animation trigger on item add
  useEffect(() => {
    if (itemCount > prevCount) {
      setIsBumped(true)
      const timer = setTimeout(() => setIsBumped(false), 300)
      return () => clearTimeout(timer)
    }
    setPrevCount(itemCount)
  }, [itemCount, prevCount])

  const handleClick = () => {
    // If not on pedidos page, go there and open cart
    if (!location.pathname.includes('/app/pedidos')) {
      setIsCartOpen(true)
      navigate('/app/pedidos')
      return
    }
    
    // If on pedidos page, toggle cart
    setIsCartOpen(!isCartOpen)
  }

  // Hide if cart is already open (on pedidos page) or if empty (optional, but cleaner)
  if (isCartOpen && location.pathname.includes('/app/pedidos')) return null
  if (itemCount === 0) return null

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-6 right-6 z-50 flex items-center gap-3 pl-4 pr-5 py-3 rounded-full 
        bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] 
        shadow-lg shadow-[color:var(--primary-bg)]/30 
        hover:scale-105 active:scale-95 transition-all duration-300 group
        ${isBumped ? 'scale-110 shadow-xl ring-4 ring-[color:var(--primary-bg)]/20' : ''}
      `}
    >
      <div className="relative">
        <ShoppingCart 
          size={24} 
          strokeWidth={2} 
          className={`transition-transform duration-300 ${isBumped ? 'rotate-[-10deg] scale-110' : ''}`}
        />
        <div className={`
          absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 
          rounded-full flex items-center justify-center border-2 border-[color:var(--primary-bg)]
          transition-transform duration-300 ${isBumped ? 'scale-125' : 'scale-100'}
        `}>
          {itemCount}
        </div>
      </div>
      <div className="flex flex-col items-start leading-none">
        <span className="text-[10px] font-medium opacity-90 uppercase tracking-wider">Total</span>
        <span className="text-sm font-bold">{formatMoney(totalCents)}</span>
      </div>
    </button>
  )
}
