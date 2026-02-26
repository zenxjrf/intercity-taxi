import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/api'
import { ChevronLeft, Users, Plus, Search, Power, Ban, CheckCircle } from 'lucide-react'

export default function AdminDriversPage() {
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers')
      setDrivers(response.data)
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const handleBlock = async (id, isBlocked) => {
    try {
      await api.patch(`/drivers/${id}/block`, { is_blocked: !isBlocked })
      fetchDrivers()
    } catch (error) {
      console.error('Error blocking driver:', error)
    }
  }

  const filteredDrivers = drivers.filter(d => {
    if (filter === 'online') return d.is_online
    if (filter === 'offline') return !d.is_online
    if (filter === 'blocked') return d.is_blocked
    if (filter === 'pending') return !d.is_approved
    return true
  }).filter(d => 
    search === '' || 
    d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.car_brand?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-tg-secondaryBg">
      {/* Header */}
      <div className="bg-tg-bg p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/admin')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Водители</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="ml-auto p-2 bg-tg-button text-tg-buttonText rounded-lg"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-tg-hint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск водителей..."
            className="w-full p-3 pl-10 bg-tg-bg rounded-lg text-tg-text"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Все' },
            { key: 'online', label: 'Онлайн' },
            { key: 'offline', label: 'Офлайн' },
            { key: 'blocked', label: 'Заблокированные' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filter === key 
                  ? 'bg-tg-button text-tg-buttonText' 
                  : 'bg-tg-bg text-tg-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers List */}
      <div className="px-4 pb-4 space-y-3">
        {filteredDrivers.map(driver => (
          <div key={driver.id} className="bg-tg-bg rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  driver.is_online ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <div>
                  <p className="font-semibold">{driver.full_name}</p>
                  <p className="text-sm text-tg-hint">
                    {driver.car_brand} {driver.car_model}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">⭐ {parseFloat(driver.rating).toFixed(1)}</span>
                {driver.is_blocked && <Ban className="w-5 h-5 text-red-500" />}
              </div>
            </div>

            <div className="text-sm text-tg-hint space-y-1 mb-3">
              <p>📞 {driver.phone || 'Нет телефона'}</p>
              <p>🚗 {driver.car_number} · {driver.car_color}</p>
              <p>✅ {driver.total_trips} поездок</p>
              {driver.can_transport_car && (
                <p className="text-purple-600">🚙 Может перегонять авто</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleBlock(driver.id, driver.is_blocked)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                  driver.is_blocked 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {driver.is_blocked ? (
                  <><CheckCircle className="w-4 h-4" /> Разблокировать</>
                ) : (
                  <><Ban className="w-4 h-4" /> Заблокировать</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Driver Modal */}
      {showAddForm && (
        <AddDriverModal 
          onClose={() => setShowAddForm(false)} 
          onSuccess={() => {
            setShowAddForm(false)
            fetchDrivers()
          }}
        />
      )}
    </div>
  )
}

function AddDriverModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    telegram_id: '',
    full_name: '',
    phone: '',
    car_brand: '',
    car_model: '',
    car_year: '',
    car_color: '',
    car_number: '',
    car_seats: 4,
    can_transport_car: false,
    experience_years: 0,
    birth_year: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/drivers', formData)
      onSuccess()
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка добавления водителя')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-tg-bg rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Добавить водителя</h3>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Telegram ID"
            value={formData.telegram_id}
            onChange={(e) => setFormData({...formData, telegram_id: e.target.value})}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="ФИО"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg"
            required
          />
          <input
            type="tel"
            placeholder="Телефон"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Марка авто"
              value={formData.car_brand}
              onChange={(e) => setFormData({...formData, car_brand: e.target.value})}
              className="w-full p-3 bg-tg-secondaryBg rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Модель авто"
              value={formData.car_model}
              onChange={(e) => setFormData({...formData, car_model: e.target.value})}
              className="w-full p-3 bg-tg-secondaryBg rounded-lg"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Год авто"
              value={formData.car_year}
              onChange={(e) => setFormData({...formData, car_year: e.target.value})}
              className="w-full p-3 bg-tg-secondaryBg rounded-lg"
            />
            <input
              type="text"
              placeholder="Цвет"
              value={formData.car_color}
              onChange={(e) => setFormData({...formData, car_color: e.target.value})}
              className="w-full p-3 bg-tg-secondaryBg rounded-lg"
            />
          </div>
          <input
            type="text"
            placeholder="Гос. номер"
            value={formData.car_number}
            onChange={(e) => setFormData({...formData, car_number: e.target.value})}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg"
          />
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.can_transport_car}
              onChange={(e) => setFormData({...formData, can_transport_car: e.target.checked})}
              className="w-4 h-4"
            />
            <span>Может перегонять автомобили</span>
          </label>

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
              {loading ? 'Добавление...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
