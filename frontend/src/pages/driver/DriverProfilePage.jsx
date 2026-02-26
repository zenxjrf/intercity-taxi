import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { User, ChevronLeft, Phone, Car, Star, MapPin, CheckCircle, Briefcase } from 'lucide-react'

export default function DriverProfilePage() {
  const navigate = useNavigate()
  const { driver, user, toggleDriverStatus } = useStore()
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    phone: driver?.phone || '',
    working_routes: driver?.working_routes || []
  })

  if (!driver) {
    return (
      <div className="min-h-screen bg-tg-secondaryBg flex items-center justify-center p-4">
        <p className="text-tg-hint">Профиль не найден</p>
      </div>
    )
  }

  const handleSave = async () => {
    // TODO: implement update driver profile
    setEditMode(false)
  }

  const calculateAge = () => {
    if (!driver.birth_year) return null
    return new Date().getFullYear() - driver.birth_year
  }

  return (
    <div className="min-h-screen bg-tg-secondaryBg pb-20">
      {/* Header */}
      <div className="bg-tg-bg p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/driver')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Профиль</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Driver Info Card */}
        <div className="bg-tg-bg rounded-lg p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-tg-secondaryBg flex items-center justify-center">
              {driver.photo_url ? (
                <img 
                  src={driver.photo_url} 
                  alt={driver.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-tg-hint" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{driver.full_name}</h2>
              <div className="flex items-center gap-1 text-sm text-tg-hint">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{parseFloat(driver.rating).toFixed(1)}</span>
                <span>· {driver.total_trips} поездок</span>
              </div>
              {calculateAge() && (
                <p className="text-sm text-tg-hint">{calculateAge()} лет</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-tg-hint">Стаж вождения</p>
              <p className="font-medium">{driver.experience_years} лет</p>
            </div>
            <div>
              <p className="text-sm text-tg-hint">Телефон</p>
              <p className="font-medium">{driver.phone || 'Не указан'}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-tg-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-tg-hint">Статус</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              driver.is_online 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {driver.is_online ? '🟢 Онлайн' : '⚪ Офлайн'}
            </span>
          </div>
          <button
            onClick={() => toggleDriverStatus(driver.id)}
            className={`w-full py-3 rounded-lg font-medium ${
              driver.is_online 
                ? 'bg-red-100 text-red-600' 
                : 'bg-green-100 text-green-600'
            }`}
          >
            {driver.is_online ? 'Закончить работу' : 'Начать работу'}
          </button>
        </div>

        {/* Car Info */}
        <div className="bg-tg-bg rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-5 h-5 text-tg-hint" />
            <h3 className="font-semibold">Автомобиль</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-tg-hint">Марка/Модель</span>
              <span className="font-medium">{driver.car_brand} {driver.car_model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tg-hint">Год выпуска</span>
              <span>{driver.car_year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tg-hint">Цвет</span>
              <span>{driver.car_color}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tg-hint">Номер</span>
              <span className="font-medium">{driver.car_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tg-hint">Мест</span>
              <span>{driver.car_seats}</span>
            </div>
            {driver.can_transport_car && (
              <div className="flex items-center gap-2 text-purple-600 mt-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Может перегонять автомобили</span>
              </div>
            )}
          </div>
        </div>

        {/* Working Routes */}
        <div className="bg-tg-bg rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-tg-hint" />
            <h3 className="font-semibold">Рабочие маршруты</h3>
          </div>
          
          {driver.working_routes && driver.working_routes.length > 0 ? (
            <div className="space-y-2">
              {driver.working_routes.map((route, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{route.from}</span>
                  <span className="text-tg-hint">→</span>
                  <span className="font-medium">{route.to}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-tg-hint text-sm">Маршруты не указаны</p>
          )}
        </div>

        {/* Stats */}
        <div className="bg-tg-bg rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-tg-hint" />
            <h3 className="font-semibold">Статистика</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-tg-secondaryBg rounded-lg">
              <p className="text-2xl font-bold text-tg-button">{driver.total_trips}</p>
              <p className="text-xs text-tg-hint">Всего поездок</p>
            </div>
            <div className="text-center p-3 bg-tg-secondaryBg rounded-lg">
              <p className="text-2xl font-bold text-tg-button">{parseFloat(driver.rating).toFixed(1)}</p>
              <p className="text-xs text-tg-hint">Рейтинг</p>
            </div>
            {driver.cancelled_orders > 0 && (
              <div className="text-center p-3 bg-tg-secondaryBg rounded-lg">
                <p className="text-2xl font-bold text-red-500">{driver.cancelled_orders}</p>
                <p className="text-xs text-tg-hint">Отмен</p>
              </div>
            )}
          </div>
        </div>
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
          <button 
            onClick={() => navigate('/driver/orders')}
            className="flex flex-col items-center p-2 text-tg-hint"
          >
            <Briefcase className="w-6 h-6" />
            <span className="text-xs mt-1">Заявки</span>
          </button>
          <button className="flex flex-col items-center p-2 text-tg-button">
            <CheckCircle className="w-6 h-6" />
            <span className="text-xs mt-1">Профиль</span>
          </button>
        </div>
      </div>
    </div>
  )
}
