import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { ChevronLeft, Package, Phone, MapPin, Calendar, User, FileText } from 'lucide-react'

export default function OrderParcelPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { createOrder } = useStore()
  const route = location.state?.route

  const [formData, setFormData] = useState({
    departure_date: '',
    parcel_weight: 1,
    parcel_description: '',
    recipient_name: '',
    recipient_phone: '',
    pickup_address: '',
    dropoff_address: '',
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

  const calculatePrice = () => {
    const calculated = formData.parcel_weight * route.parcel_price_per_kg
    return Math.max(calculated, route.parcel_min_price)
  }

  const totalPrice = calculatePrice()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const result = await createOrder({
      order_type: 'parcel',
      city_from: route.city_from,
      city_to: route.city_to,
      departure_date: formData.departure_date,
      parcel_weight: formData.parcel_weight,
      parcel_description: formData.parcel_description,
      recipient_name: formData.recipient_name,
      recipient_phone: formData.recipient_phone,
      pickup_address: formData.pickup_address,
      dropoff_address: formData.dropoff_address,
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
    return formData.departure_date && 
           formData.parcel_description &&
           formData.recipient_name &&
           formData.recipient_phone &&
           formData.pickup_address && 
           formData.dropoff_address && 
           formData.phone
  }

  return (
    <div className="min-h-screen bg-tg-secondaryBg">
      <div className="bg-tg-bg p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Отправка посылки</h1>
      </div>

      <div className="p-4 space-y-4 pb-32">
        <div className="bg-tg-bg rounded-lg p-4">
          <p className="text-sm text-tg-hint mb-1">Маршрут</p>
          <p className="font-semibold">{route.city_from} → {route.city_to}</p>
        </div>

        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <Calendar className="w-4 h-4" />
            Дата отправки
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
            <Package className="w-4 h-4" />
            Вес посылки (кг)
          </label>
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => setFormData({ ...formData, parcel_weight: Math.max(0.1, formData.parcel_weight - 0.5) })}
              className="w-10 h-10 bg-tg-secondaryBg rounded-full flex items-center justify-center text-lg font-semibold"
            >
              −
            </button>
            <input
              type="number"
              step="0.1"
              value={formData.parcel_weight}
              onChange={(e) => setFormData({ ...formData, parcel_weight: parseFloat(e.target.value) || 0 })}
              className="text-xl font-semibold w-20 text-center bg-transparent"
            />
            <button
              onClick={() => setFormData({ ...formData, parcel_weight: formData.parcel_weight + 0.5 })}
              className="w-10 h-10 bg-tg-secondaryBg rounded-full flex items-center justify-center text-lg font-semibold"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <FileText className="w-4 h-4" />
            Описание посылки
          </label>
          <textarea
            value={formData.parcel_description}
            onChange={(e) => setFormData({ ...formData, parcel_description: e.target.value })}
            placeholder="Что отправляете?"
            rows={2}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text resize-none"
          />
        </div>

        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <User className="w-4 h-4" />
            ФИО получателя
          </label>
          <input
            type="text"
            value={formData.recipient_name}
            onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
            placeholder="Имя получателя"
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
          />
        </div>

        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <Phone className="w-4 h-4" />
            Телефон получателя
          </label>
          <input
            type="tel"
            value={formData.recipient_phone}
            onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
            placeholder="+7 (___) ___-__-__"
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
          />
        </div>

        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <MapPin className="w-4 h-4" />
            Адрес забора (отправитель)
          </label>
          <input
            type="text"
            value={formData.pickup_address}
            onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
            placeholder="Откуда забрать посылку"
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
          />
        </div>

        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <MapPin className="w-4 h-4" />
            Адрес доставки (получатель)
          </label>
          <input
            type="text"
            value={formData.dropoff_address}
            onChange={(e) => setFormData({ ...formData, dropoff_address: e.target.value })}
            placeholder="Куда доставить посылку"
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
          />
        </div>

        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <Phone className="w-4 h-4" />
            Ваш телефон
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+7 (___) ___-__-__"
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
          />
        </div>

        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <FileText className="w-4 h-4" />
            Комментарий
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Дополнительная информация..."
            rows={2}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-tg-bg border-t border-tg-hint/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-tg-hint">Итого:</p>
            <p className="text-2xl font-bold text-tg-button">{totalPrice} ₽</p>
          </div>
          <p className="text-xs text-tg-hint">
            {formData.parcel_weight} кг × {route.parcel_price_per_kg} ₽
            <br />мин. {route.parcel_min_price} ₽
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

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-tg-bg rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Подтвердите заказ</h3>
            <div className="space-y-2 text-sm mb-4">
              <p><span className="text-tg-hint">Маршрут:</span> {route.city_from} → {route.city_to}</p>
              <p><span className="text-tg-hint">Вес:</span> {formData.parcel_weight} кг</p>
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
