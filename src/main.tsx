import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useUiStore } from '@shared/stores/uiStore'

function applyAppearance(theme: 'light' | 'dark', themeId: string) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }

  if (themeId && themeId !== 'default') {
    document.documentElement.setAttribute('data-skin', themeId)
  } else {
    document.documentElement.removeAttribute('data-skin')
  }
}

applyAppearance(useUiStore.getState().theme, useUiStore.getState().themeId)
useUiStore.subscribe((state) => applyAppearance(state.theme, state.themeId))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

requestAnimationFrame(() => {
  const preload = document.getElementById('app-preload')
  if (!preload) return
  preload.classList.add('preload-hide')
  window.setTimeout(() => preload.remove(), 260)
})
