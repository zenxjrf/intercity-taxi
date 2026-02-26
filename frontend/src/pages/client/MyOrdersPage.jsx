import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { MapPin, Users, Package, ChevronLeft, Star, Clock, CheckCircle, XCircle, Car } from 'lucide-react'

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const { orders, fetchMyOrders } = useStore()
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchMyOrders(filter)
  }, [fetchMyOrders, filter])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />
      case 'accepted': return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'driver_on_way': return <Car className="w-5 h-5 text-blue-600" />
      case 'in_progress': return <Car className="w-5 h-5 text-green-500" />
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает водителя'
      case 'accepted': return 'Принят'
      case 'driver_on_way': return 'Водитель в пути'
      case 'in_progress': return 'В поездке'
      case 'completed': return 'Завершён'
      case 'cancelled': return 'Отменён'
      default: return status
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'trip': return <Users className="w-5 h-5" />
      case 'parcel': return <Package className="w-5 h-5" />
      case 'car_transport': return <Car className="w-5 h-5" />
      default: return <MapPin className="w-5 h-5" />
    }
  }

  const getTypeText = (type) => {
    switch (type) {
      case 'trip': return 'Поездка'
      case 'parcel': return 'Посылка'
      case 'car_transport': return 'Перегон авто'
      default: return type
    }
  }

  return (
    <div className="min-h-screen bg-tg-secondaryBg pb-20">
      {/* Header */}
      <div className="bg-tg-bg p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Мои заказы</h1>
      </div>

      {/* Filters */}
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Все' },
            { key: 'active', label: 'Активные' },
            { key: 'completed', label: 'Завершённые' },
            { key: 'cancelled', label: 'Отменённые' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === key 
                  ? 'bg-tg-button text-tg-buttonText' 
                  : 'bg-tg-bg text-tg-text border border-tg-hint/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 space-y-3">
        {orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className="bg-tg-bg rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    order.order_type === 'trip' ? 'bg-blue-100 text-blue-600' :
                    order.order_type === 'parcel' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {getTypeIcon(order.order_type)}
                  </div>
                  <div>
                    <p className="font-medium">{getTypeText(order.order_type)}</p>
                    <p className="text-sm text-tg-hint">№{order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  <span className="text-sm">{getStatusText(order.status)}</span>
                </div>
              </div>

              <div className="mb-3">
                <p className="font-semibold">
                  {order.city_from} → {order.city_to}
                </p>
                <p className="text-sm text-tg-hint">
                  {new Date(order.departure_date).toLocaleDateString('ru-RU')}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-tg-button">
                  {order.calculated_price} ₽
                </p>
                {order.status === 'completed' && !order.reviewed && (
                  <button
                    onClick={() => navigate(`/review/${order.id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm"
                  >
                    <Star className="w-4 h-4" />
                    Оценить
                  </button>
                )}
              </div>

              {order.driver_name && (
                <div className="mt-3 pt-3 border-t border-tg-hint/20">
                  <p className="text-sm text-tg-hint">Водитель:</p>
                  <p className="font-medium">{order.driver_name}</p>
                  {order.driver_phone && (
                    <p className="text-sm text-tg-button">{order.driver_phone}</p>
                  )}
                  {order.car_brand && (
                    <p className="text-sm text-tg-hint">
                      {order.car_brand} {order.car_model}, {order.car_number}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-tg-hint">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>У вас пока нет заказов</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-3 bg-tg-button text-tg-buttonText rounded-lg"
            >
              Сделать первый заказ
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-tg-bg border-t border-tg-hint/20 p-2">
        <div className="flex justify-around">
          <button 
            onClick={() => navigate('/')}
            className="flex flex-col items-center p-2 text-tg-hint"
          >
            <MapPin className="w-6 h-6" />
            <span className="text-xs mt-1">Главная</span>
          </button>
          <button 
            onClick={() => navigate('/drivers')}
            className="flex flex-col items-center p-2 text-tg-hint"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Водители</span>
          </button>
          <button 
            onClick={() => navigate('/orders')}
            className="flex flex-col items-center p-2 text-tg-button"
          >
            <Package className="w-6 h-6" />
            <span className="text-xs mt-1">Заказы</span>
          </button>
        </div>
      </div>
    </div>
  )
}
