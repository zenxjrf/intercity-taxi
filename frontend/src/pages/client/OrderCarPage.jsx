import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { ChevronLeft, Car, Phone, MapPin, Calendar, FileText } from 'lucide-react'

export default function OrderCarPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { createOrder } = useStore()
  const route = location.state?.route

  const [formData, setFormData] = useState({
    departure_date: '',
    client_car_brand: '',
    client_car_model: '',
    client_car_year: '',
    client_car_number: '',
    additional_info: '',
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

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const result = await createOrder({
      order_type: 'car_transport',
      city_from: route.city_from,
      city_to: route.city_to,
      departure_date: formData.departure_date,
      client_car_brand: formData.client_car_brand,
      client_car_model: formData.client_car_model,
      client_car_year: parseInt(formData.client_car_year) || null,
      client_car_number: formData.client_car_number,
      comment: formData.additional_info + (formData.comment ? '\n' + formData.comment : ''),
      phone: formData.phone,
      calculated_price: route.car_transport_price
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
           formData.client_car_brand && 
           formData.client_car_model && 
           formData.phone
  }

  return (
    <div className="min-h-screen bg-tg-secondaryBg">
      <div className="bg-tg-bg p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Перегон автомобиля</h1>
      </div>

      <div className="p-4 space-y-4 pb-32">
        <div className="bg-tg-bg rounded-lg p-4">
          <p className="text-sm text-tg-hint mb-1">Маршрут</p>
          <p className="font-semibold">{route.city_from} → {route.city_to}</p>
        </div>

        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <Calendar className="w-4 h-4" />
            Дата перегона
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
            <Car className="w-4 h-4" />
            Марка автомобиля
          </label>
          <input
            type="text"
            value={formData.client_car_brand}
            onChange={(e) => setFormData({ ...formData, client_car_brand: e.target.value })}
            placeholder="Например: Toyota"
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
          />
        </div>

        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <Car className="w-4 h-4" />
            Модель автомобиля
          </label>
          <input
            type="text"
            value={formData.client_car_model}
            onChange={(e) => setFormData({ ...formData, client_car_model: e.target.value })}
            placeholder="Например: Camry"
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-tg-bg rounded-lg p-4">
            <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
              <Calendar className="w-4 h-4" />
              Год выпуска
            </label>
            <input
              type="number"
              value={formData.client_car_year}
              onChange={(e) => setFormData({ ...formData, client_car_year: e.target.value })}
              placeholder="2020"
              className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
            />
          </div>
          <div className="bg-tg-bg rounded-lg p-4">
            <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
              <MapPin className="w-4 h-4" />
              Гос. номер
            </label>
            <input
              type="text"
              value={formData.client_car_number}
              onChange={(e) => setFormData({ ...formData, client_car_number: e.target.value })}
              placeholder="А123БС77"
              className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text"
            />
          </div>
        </div>

        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <FileText className="w-4 h-4" />
            Дополнительная информация
          </label>
          <textarea
            value={formData.additional_info}
            onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
            placeholder="Объём двигателя, особенности управления, нужно ли сопровождение..."
            rows={3}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text resize-none"
          />
        </div>

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

        <div className="bg-tg-bg rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm text-tg-hint mb-2">
            <FileText className="w-4 h-4" />
            Комментарий
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Дополнительные пожелания..."
            rows={2}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-tg-bg border-t border-tg-hint/20 p-4">
        <div className="mb-3">
          <p className="text-sm text-tg-hint">Фиксированная цена:</p>
          <p className="text-2xl font-bold text-tg-button">{route.car_transport_price} ₽</p>
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
              <p><span className="text-tg-hint">Авто:</span> {formData.client_car_brand} {formData.client_car_model}</p>
              <p><span className="text-tg-hint">Сумма:</span> <span className="font-bold text-tg-button">{route.car_transport_price} ₽</span></p>
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
