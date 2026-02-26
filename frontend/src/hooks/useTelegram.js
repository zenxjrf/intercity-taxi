import { useState, useEffect } from 'react'

export function useTelegram() {
  const [tg, setTg] = useState(null)
  const [initData, setInitData] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      setTg(webApp)
      setInitData(webApp.initData)
      
      // Set theme colors
      webApp.setHeaderColor(webApp.themeParams.bg_color)
      webApp.setBackgroundColor(webApp.themeParams.bg_color)
      
      // Expand to full height
      webApp.expand()
      
      // Notify Telegram that app is ready
      webApp.ready()
      
      setReady(true)
    } else {
      // For local development - generate valid mock initData
      const mockUser = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'ru'
      }
      const authDate = Math.floor(Date.now() / 1000)
      
      // Build initData string (without hash for local dev - backend will accept it)
      const params = new URLSearchParams()
      params.set('user', JSON.stringify(mockUser))
      params.set('auth_date', authDate.toString())
      params.set('query_id', 'mock_query_id')
      
      setInitData(params.toString())
      setReady(true)
    }
  }, [])

  const closeApp = () => {
    tg?.close()
  }

  const showMainButton = (text, onClick) => {
    if (tg?.MainButton) {
      tg.MainButton.setText(text)
      tg.MainButton.onClick(onClick)
      tg.MainButton.show()
    }
  }

  const hideMainButton = () => {
    tg?.MainButton?.hide()
  }

  return {
    tg,
    initData,
    ready,
    closeApp,
    showMainButton,
    hideMainButton,
    themeParams: tg?.themeParams || {}
  }
}
