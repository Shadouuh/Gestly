import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'

import { AppRouter } from '@app/router/AppRouter'
import { useUiStore } from '@shared/stores/uiStore'

export default function App() {
  const theme = useUiStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
