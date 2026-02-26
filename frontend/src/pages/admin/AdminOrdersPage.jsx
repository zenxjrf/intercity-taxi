import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/api'
import { ChevronLeft, Filter, Search, Users, Package, Car, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react'

export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    order_type: '',
    city_from: '',
    city_to: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    try {
      const params = {}
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value
      })
      
      const response = await api.get('/orders', { params })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      fetchOrders()
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка изменения статуса')
    }
  }

  const handleCancel = async (orderId) => {
    const reason = prompt('Причина отмены:')
    if (!reason) return
    
    try {
      await api.patch(`/orders/${orderId}/cancel`, { reason })
      fetchOrders()
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка отмены')
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'trip': return <Users className="w-4 h-4" />
      case 'parcel': return <Package className="w-4 h-4" />
      case 'car_transport': return <Car className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'accepted': return 'text-blue-600 bg-blue-100'
      case 'driver_on_way': return 'text-blue-700 bg-blue-200'
      case 'in_progress': return 'text-green-600 bg-green-100'
      case 'completed': return 'text-green-700 bg-green-200'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-tg-secondaryBg">
      <div className="bg-tg-bg p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/admin')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Все заказы</h1>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="ml-auto p-2 text-tg-button"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-tg-bg border-b border-tg-hint/20 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="p-2 bg-tg-secondaryBg rounded-lg"
            >
              <option value="">Все статусы</option>
              <option value="pending">Ожидает</option>
              <option value="accepted">Принят</option>
              <option value="driver_on_way">Водитель в пути</option>
              <option value="in_progress">В поездке</option>
              <option value="completed">Завершён</option>
              <option value="cancelled">Отменён</option>
            </select>
            <select
              value={filters.order_type}
              onChange={(e) => setFilters({...filters, order_type: e.target.value})}
              className="p-2 bg-tg-secondaryBg rounded-lg"
            >
              <option value="">Все типы</option>
              <option value="trip">Поездка</option>
              <option value="parcel">Посылка</option>
              <option value="car_transport">Перегон</option>
            </select>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="p-4 space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-tg-bg rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded ${getTypeIcon(order.order_type)}`}>
                  {order.order_type === 'trip' ? <Users className="w-4 h-4" /> :
                   order.order_type === 'parcel' ? <Package className="w-4 h-4" /> :
                   <Car className="w-4 h-4" />}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status === 'pending' ? 'Ожидает' :
                   order.status === 'accepted' ? 'Принят' :
                   order.status === 'driver_on_way' ? 'В пути' :
                   order.status === 'in_progress' ? 'В поездке' :
                   order.status === 'completed' ? 'Завершён' :
                   order.status === 'cancelled' ? 'Отменён' : order.status}
                </span>
              </div>
              <p className="font-bold text-tg-button">{order.calculated_price} ₽</p>
            </div>

            <div className="mb-3">
              <p className="font-semibold">{order.city_from} → {order.city_to}</p>
              <p className="text-sm text-tg-hint">
                {new Date(order.departure_date).toLocaleDateString('ru-RU')}
                {order.departure_time && ` в ${order.departure_time.substring(0, 5)}`}
              </p>
            </div>

            <div className="text-sm space-y-1 mb-3">
              <p><span className="text-tg-hint">Клиент:</span> {order.client_first_name}</p>
              <p><span className="text-tg-hint">Телефон:</span> {order.client_phone}</p>
              {order.driver_name && (
                <p><span className="text-tg-hint">Водитель:</span> {order.driver_name}</p>
              )}
            </div>

            {/* Actions */}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-tg-hint/20">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(order.id, 'accepted')}
                      className="flex-1 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium"
                    >
                      Принять
                    </button>
                  </>
                )}
                {order.status === 'accepted' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'driver_on_way')}
                    className="flex-1 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium"
                  >
                    В пути к клиенту
                  </button>
                )}
                {order.status === 'driver_on_way' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'in_progress')}
                    className="flex-1 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-medium"
                  >
                    Поездка началась
                  </button>
                )}
                {order.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'completed')}
                    className="flex-1 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-medium"
                  >
                    Завершить
                  </button>
                )}
                <button
                  onClick={() => handleCancel(order.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium"
                >
                  Отменить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
