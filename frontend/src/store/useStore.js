import { create } from 'zustand'
import { api, setAuthHeader } from '../api/api'

export const useStore = create((set, get) => ({
  // User state
  user: null,
  driver: null,
  role: 'client', // client | driver | admin
  
  // Loading state
  loading: false,
  error: null,
  
  // Data
  prices: [],
  orders: [],
  drivers: [],
  onlineDrivers: [],
  currentOrder: null,
  
  // Auth
  initAuth: async (initData) => {
    set({ loading: true, error: null })
    try {
      setAuthHeader(initData)
      const response = await api.post('/auth/verify')
      const { user, driver } = response.data
      
      set({
        user,
        driver,
        role: user.role,
        loading: false
      })
      
      // Redirect based on role
      if (user.role === 'driver' && driver) {
        window.history.replaceState({}, '', '/driver')
      }
    } catch (err) {
      set({
        error: err.response?.data?.error || 'Ошибка авторизации',
        loading: false
      })
    }
  },
  
  // Prices
  fetchPrices: async () => {
    try {
      const response = await api.get('/prices')
      set({ prices: response.data })
    } catch (err) {
      console.error('Fetch prices error:', err)
    }
  },
  
  fetchPrice: async (cityFrom, cityTo) => {
    try {
      const response = await api.get(`/prices/${cityFrom}/${cityTo}`)
      return response.data
    } catch (err) {
      console.error('Fetch price error:', err)
      return null
    }
  },
  
  // Drivers
  fetchOnlineDrivers: async () => {
    try {
      const response = await api.get('/drivers/online')
      set({ onlineDrivers: response.data })
    } catch (err) {
      console.error('Fetch online drivers error:', err)
    }
  },
  
  fetchOnlineCount: async () => {
    try {
      const response = await api.get('/drivers/online/count')
      return response.data.count
    } catch (err) {
      console.error('Fetch online count error:', err)
      return 0
    }
  },
  
  // Orders
  fetchMyOrders: async (status = 'all') => {
    try {
      const response = await api.get('/orders/my', { params: { status } })
      set({ orders: response.data })
    } catch (err) {
      console.error('Fetch orders error:', err)
    }
  },
  
  fetchAvailableOrders: async () => {
    try {
      const response = await api.get('/orders/available')
      return response.data
    } catch (err) {
      console.error('Fetch available orders error:', err)
      return []
    }
  },
  
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData)
      return { success: true, order: response.data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Ошибка создания заказа' 
      }
    }
  },
  
  acceptOrder: async (orderId) => {
    try {
      const response = await api.patch(`/orders/${orderId}/accept`)
      return { success: true, order: response.data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Ошибка принятия заказа' 
      }
    }
  },
  
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status })
      return { success: true, order: response.data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Ошибка обновления статуса' 
      }
    }
  },
  
  cancelOrder: async (orderId, reason) => {
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`, { reason })
      return { success: true, order: response.data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Ошибка отмены заказа' 
      }
    }
  },
  
  // Driver actions
  toggleDriverStatus: async (driverId) => {
    try {
      const response = await api.patch(`/drivers/${driverId}/status`)
      set({ driver: response.data })
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Ошибка изменения статуса' 
      }
    }
  },
  
  // Reviews
  createReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData)
      return { success: true, review: response.data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Ошибка отправки отзыва' 
      }
    }
  }
}))
