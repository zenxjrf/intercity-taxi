import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/api'
import { ChevronLeft, Plus, Trash2, Edit2 } from 'lucide-react'

export default function AdminPricesPage() {
  const navigate = useNavigate()
  const [prices, setPrices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingPrice, setEditingPrice] = useState(null)

  useEffect(() => {
    fetchPrices()
  }, [])

  const fetchPrices = async () => {
    try {
      const response = await api.get('/prices')
      setPrices(response.data)
    } catch (error) {
      console.error('Error fetching prices:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот маршрут?')) return
    try {
      await api.delete(`/prices/${id}`)
      fetchPrices()
    } catch (error) {
      console.error('Error deleting price:', error)
    }
  }

  return (
    <div className="min-h-screen bg-tg-secondaryBg">
      <div className="bg-tg-bg p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/admin')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Цены и маршруты</h1>
        <button 
          onClick={() => { setEditingPrice(null); setShowForm(true) }}
          className="ml-auto p-2 bg-tg-button text-tg-buttonText rounded-lg"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {prices.map(price => (
          <div key={price.id} className="bg-tg-bg rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-lg">{price.city_from} → {price.city_to}</p>
                <p className="text-sm text-tg-hint">{price.distance_km} км</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingPrice(price); setShowForm(true) }}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(price.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-tg-secondaryBg rounded-lg p-2">
                <p className="text-tg-hint">Поездка</p>
                <p className="font-semibold">{price.trip_price_per_person} ₽/чел</p>
              </div>
              <div className="bg-tg-secondaryBg rounded-lg p-2">
                <p className="text-tg-hint">Перегон авто</p>
                <p className="font-semibold">{price.car_transport_price} ₽</p>
              </div>
              <div className="bg-tg-secondaryBg rounded-lg p-2">
                <p className="text-tg-hint">Посылка</p>
                <p className="font-semibold">от {price.parcel_min_price} ₽</p>
                <p className="text-xs text-tg-hint">{price.parcel_price_per_kg} ₽/кг</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <PriceFormModal
          price={editingPrice}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            fetchPrices()
          }}
        />
      )}
    </div>
  )
}

function PriceFormModal({ price, onClose, onSuccess }) {
  const [formData, setFormData] = useState(price || {
    city_from: '',
    city_to: '',
    trip_price_per_person: '',
    parcel_price_per_kg: '',
    parcel_min_price: '',
    car_transport_price: '',
    distance_km: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (price) {
        await api.put(`/prices/${price.id}`, formData)
      } else {
        await api.post('/prices', formData)
      }
      onSuccess()
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка сохранения')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-tg-bg rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {price ? 'Редактировать маршрут' : 'Новый маршрут'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Откуда"
              value={formData.city_from}
              onChange={(e) => setFormData({...formData, city_from: e.target.value})}
              className="w-full p-3 bg-tg-secondaryBg rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Куда"
              value={formData.city_to}
              onChange={(e) => setFormData({...formData, city_to: e.target.value})}
              className="w-full p-3 bg-tg-secondaryBg rounded-lg"
              required
            />
          </div>
          
          <input
            type="number"
            placeholder="Цена поездки за человека (₽)"
            value={formData.trip_price_per_person}
            onChange={(e) => setFormData({...formData, trip_price_per_person: parseFloat(e.target.value)})}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg"
            required
          />
          
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Цена посылки за кг"
              value={formData.parcel_price_per_kg}
              onChange={(e) => setFormData({...formData, parcel_price_per_kg: parseFloat(e.target.value)})}
              className="w-full p-3 bg-tg-secondaryBg rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="Мин. цена посылки"
              value={formData.parcel_min_price}
              onChange={(e) => setFormData({...formData, parcel_min_price: parseFloat(e.target.value)})}
              className="w-full p-3 bg-tg-secondaryBg rounded-lg"
              required
            />
          </div>
          
          <input
            type="number"
            placeholder="Цена перегона авто (₽)"
            value={formData.car_transport_price}
            onChange={(e) => setFormData({...formData, car_transport_price: parseFloat(e.target.value)})}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg"
            required
          />
          
          <input
            type="number"
            placeholder="Расстояние (км)"
            value={formData.distance_km}
            onChange={(e) => setFormData({...formData, distance_km: parseInt(e.target.value)})}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg"
          />

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-tg-secondaryBg rounded-lg"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-tg-button text-tg-buttonText rounded-lg disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
