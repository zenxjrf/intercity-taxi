import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { ChevronLeft, Users, Phone, MapPin, Calendar, Clock, MessageSquare } from 'lucide-react'

export default function OrderTripPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { createOrder } = useStore()
  const route = location.state?.route

  const [formData, setFormData] = useState({
    pickup_address: '',
    dropoff_address: '',
    departure_date: '',
    departure_time: '',
    passengers_count: 1,
    phone: '',
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  if (!route) {
    return (
      <div className="min-h-screen bg-tg-secondaryBg p-4">
        <p className="text-center text-tg-hint">Сначала выберите маршрут</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full py-3 bg-tg-button text-tg-buttonText rounded-lg"
        >
          На главную
        </button>
      </div>
    )
  }

  const totalPrice = route.trip_price_per_person * formData.passengers_count

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const result = await createOrder({
      order_type: 'trip',
      city_from: route.city_from,
      city_to: route.city_to,
      pickup_address: formData.pickup_address,
      dropoff_address: formData.dropoff_address,
      departure_date: formData.departure_date,
      departure_time: formData.departure_time,
      passengers_count: formData.passengers_count,
      phone: formData.phone,
      comment: formData.comment,
      calculated_price: totalPrice
    })

    setLoading(false)

    if (result.success) {
      navigate('/orders')
    } else {
      setError(result.error)
    }
  }

  const isValid = () => {
    return formData.pickup_address && 
           formData.dropoff_address && 
           formData.departure_date && 
           formData.phone
  }

  return (
    <div className="min-h-screen bg-tg-secondaryBg">
      {/* Header */}
      <div className="bg-tg-bg p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Заказ поездки</h1>
      </div>

      <div className="p-4 space-y-4 pb-32">
        {/* Route Info */}
        <div className="bg-tg-bg rounded-lg p-4">
          <p className="text-sm text-tg-hint mb-1">Маршрут</p>
          <p className="font-semibold">{route.city_from} → {route.city_to}</p>
        </div>

        {/* Pickup Address */}
        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <MapPin className="w-4 h-4" />
            Адрес подачи
          </label>
          <input
            type="text"
            value={formData.pickup_address}
            onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
            placeholder="Откуда забрать"
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
          />
        </div>

        {/* Dropoff Address */}
        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <MapPin className="w-4 h-4" />
            Адрес назначения
          </label>
          <input
            type="text"
            value={formData.dropoff_address}
            onChange={(e) => setFormData({ ...formData, dropoff_address: e.target.value })}
            placeholder="Куда довезти"
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-tg-bg rounded-lg p-4">
            <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
              <Calendar className="w-4 h-4" />
              Дата
            </label>
            <input
              type="date"
              value={formData.departure_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
              className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
            />
          </div>
          <div className="bg-tg-bg rounded-lg p-4">
            <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
              <Clock className="w-4 h-4" />
              Время
            </label>
            <input
              type="time"
              value={formData.departure_time}
              onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
              className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
            />
          </div>
        </div>

        {/* Passengers */}
        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <Users className="w-4 h-4" />
            Пассажиров
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFormData({ ...formData, passengers_count: Math.max(1, formData.passengers_count - 1) })}
              className="w-10 h-10 bg-tg-secondaryBg rounded-full flex items-center justify-center text-lg font-semibold"
            >
              −
            </button>
            <span className="text-xl font-semibold w-8 text-center">
              {formData.passengers_count}
            </span>
            <button
              onClick={() => setFormData({ ...formData, passengers_count: formData.passengers_count + 1 })}
              className="w-10 h-10 bg-tg-secondaryBg rounded-full flex items-center justify-center text-lg font-semibold"
            >
              +
            </button>
          </div>
        </div>

        {/* Phone */}
        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <Phone className="w-4 h-4" />
            Контактный телефон
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+7 (___) ___-__-__"
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
          />
        </div>

        {/* Comment */}
        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <MessageSquare className="w-4 h-4" />
            Комментарий (необязательно)
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Дополнительные пожелания..."
            rows={3}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text resize-none"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>

      {/* Bottom Price & Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-tg-bg border-t border-tg-hint/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-tg-hint">Итого:</p>
            <p className="text-2xl font-bold text-tg-button">{totalPrice} ₽</p>
          </div>
          <p className="text-sm text-tg-hint">
            {route.trip_price_per_person} ₽ × {formData.passengers_count}
          </p>
        </div>
        <button
          onClick={() => isValid() ? setShowConfirm(true) : setError('Заполните все обязательные поля')}
          disabled={loading}
          className="w-full py-4 bg-tg-button text-tg-buttonText rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? 'Оформление...' : 'Оформить заказ'}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-tg-bg rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Подтвердите заказ</h3>
            <div className="space-y-2 text-sm mb-4">
              <p><span className="text-tg-hint">Маршрут:</span> {route.city_from} → {route.city_to}</p>
              <p><span className="text-tg-hint">Дата:</span> {formData.departure_date}</p>
              <p><span className="text-tg-hint">Пассажиров:</span> {formData.passengers_count}</p>
              <p><span className="text-tg-hint">Сумма:</span> <span className="font-bold text-tg-button">{totalPrice} ₽</span></p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-tg-secondaryBg rounded-lg font-medium"
              >
                Назад
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-tg-button text-tg-buttonText rounded-lg font-medium disabled:opacity-50"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
