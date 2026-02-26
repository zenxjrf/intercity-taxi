import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { User, Briefcase, CheckCircle, ChevronLeft, Users, Package, Car, MapPin, Calendar, Clock, Phone, Check, X } from 'lucide-react'

export default function DriverOrdersPage() {
  const navigate = useNavigate()
  const { fetchAvailableOrders, fetchMyOrders, acceptOrder, orders, driver } = useStore()
  const [availableOrders, setAvailableOrders] = useState([])
  const [activeTab, setActiveTab] = useState('available')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [activeTab])

  const loadOrders = async () => {
    if (activeTab === 'available') {
      const orders = await fetchAvailableOrders()
      setAvailableOrders(orders)
    } else {
      await fetchMyOrders(activeTab === 'active' ? 'active' : 'completed')
    }
  }

  const handleAccept = async (orderId) => {
    setLoading(true)
    const result = await acceptOrder(orderId)
    setLoading(false)
    if (result.success) {
      loadOrders()
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
      case 'car_transport': return 'Перегон'
      default: return type
    }
  }

  const displayOrders = activeTab === 'available' ? availableOrders : orders

  return (
    <div className="min-h-screen bg-tg-secondaryBg pb-20">
      {/* Header */}
      <div className="bg-tg-bg p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/driver')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Заявки</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-tg-hint/20 bg-tg-bg">
        {[
          { key: 'available', label: 'Доступные' },
          { key: 'active', label: 'Активные' },
          { key: 'completed', label: 'История' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === key 
                ? 'text-tg-button border-b-2 border-tg-button' 
                : 'text-tg-hint'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-3">
        {displayOrders.length > 0 ? (
          displayOrders.map(order => (
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
                    <p className="text-xs text-tg-hint">№{order.id}</p>
                  </div>
                </div>
                <p className="font-bold text-tg-button">{order.calculated_price} ₽</p>
              </div>

              <div className="mb-3">
                <p className="font-semibold">
                  {order.city_from} → {order.city_to}
                </p>
                <div className="flex items-center gap-1 text-sm text-tg-hint mt-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.departure_date).toLocaleDateString('ru-RU')}
                  {order.departure_time && (
                    <>
                      <Clock className="w-4 h-4 ml-2" />
                      {order.departure_time.substring(0, 5)}
                    </>
                  )}
                </div>
              </div>

              {order.passengers_count && (
                <p className="text-sm text-tg-hint mb-2">
                  Пассажиров: {order.passengers_count}
                </p>
              )}
              {order.parcel_weight && (
                <p className="text-sm text-tg-hint mb-2">
                  Вес: {order.parcel_weight} кг
                </p>
              )}

              {activeTab === 'available' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAccept(order.id)}
                    disabled={loading}
                    className="flex-1 py-2 bg-tg-button text-tg-buttonText rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Принять
                  </button>
                  <button
                    className="flex-1 py-2 bg-tg-secondaryBg text-tg-text rounded-lg text-sm font-medium flex items-center justify-center gap-1 border border-tg-hint/20"
                  >
                    <X className="w-4 h-4" />
                    Пропустить
                  </button>
                </div>
              )}

              {order.status !== 'pending' && (
                <div className="mt-3 pt-3 border-t border-tg-hint/20">
                  <p className="text-sm">
                    <span className="text-tg-hint">Статус:</span>{' '}
                    <span className="font-medium">
                      {order.status === 'accepted' ? 'Принят' :
                       order.status === 'driver_on_way' ? 'В пути к клиенту' :
                       order.status === 'in_progress' ? 'В поездке' :
                       order.status === 'completed' ? 'Завершён' :
                       order.status === 'cancelled' ? 'Отменён' : order.status}
                    </span>
                  </p>
                  {order.client_first_name && (
                    <p className="text-sm mt-1">
                      <span className="text-tg-hint">Клиент:</span> {order.client_first_name}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-tg-hint">
            <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Нет {activeTab === 'available' ? 'доступных' : activeTab === 'active' ? 'активных' : 'завершённых'} заявок</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-tg-bg border-t border-tg-hint/20 p-2">
        <div className="flex justify-around">
          <button 
            onClick={() => navigate('/driver')}
            className="flex flex-col items-center p-2 text-tg-hint"
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Главная</span>
          </button>
          <button className="flex flex-col items-center p-2 text-tg-button">
            <Briefcase className="w-6 h-6" />
            <span className="text-xs mt-1">Заявки</span>
          </button>
          <button 
            onClick={() => navigate('/driver/profile')}
            className="flex flex-col items-center p-2 text-tg-hint"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="text-xs mt-1">Профиль</span>
          </button>
        </div>
      </div>
    </div>
  )
}
