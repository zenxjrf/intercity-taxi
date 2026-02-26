import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useTelegram } from '../../hooks/useTelegram'
import { User, Briefcase, CheckCircle, Power, Star, ChevronRight } from 'lucide-react'

export default function DriverHomePage() {
  const navigate = useNavigate()
  const { tg } = useTelegram()
  const { driver, toggleDriverStatus, fetchAvailableOrders, orders } = useStore()
  const [availableCount, setAvailableCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [todayCompleted, setTodayCompleted] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const available = await fetchAvailableOrders()
    setAvailableCount(available.length)
    // TODO: fetch active orders count and today's completed
  }

  const handleToggleStatus = async () => {
    if (driver) {
      await toggleDriverStatus(driver.id)
    }
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-tg-secondaryBg flex items-center justify-center p-4">
        <p className="text-tg-hint">Профиль водителя не найден</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tg-secondaryBg pb-20">
      {/* Header with Driver Info */}
      <div className="bg-tg-bg p-4 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-tg-secondaryBg flex items-center justify-center">
            {driver.photo_url ? (
              <img 
                src={driver.photo_url} 
                alt={driver.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-tg-hint" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{driver.full_name}</h1>
            <div className="flex items-center gap-1 text-sm text-tg-hint">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{parseFloat(driver.rating).toFixed(1)}</span>
              <span>· {driver.total_trips} поездок</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/driver/profile')}
            className="p-2 text-tg-button"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Status Toggle */}
        <button
          onClick={handleToggleStatus}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
            driver.is_online 
              ? 'bg-red-100 text-red-600' 
              : 'bg-green-100 text-green-600'
          }`}
        >
          <Power className="w-5 h-5" />
          {driver.is_online ? '🔴 Закончить работу' : '🟢 Начать работу'}
        </button>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-tg-bg rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-tg-button">{availableCount}</p>
          <p className="text-xs text-tg-hint">Новых заявок</p>
        </div>
        <div className="bg-tg-bg rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-500">{activeCount}</p>
          <p className="text-xs text-tg-hint">Активных</p>
        </div>
        <div className="bg-tg-bg rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-500">{todayCompleted}</p>
          <p className="text-xs text-tg-hint">Сегодня</p>
        </div>
      </div>

      {/* Car Info */}
      <div className="px-4 mb-4">
        <div className="bg-tg-bg rounded-lg p-4">
          <p className="text-sm text-tg-hint mb-1">Автомобиль</p>
          <p className="font-semibold">{driver.car_brand} {driver.car_model}</p>
          <p className="text-sm text-tg-hint">
            {driver.car_year} · {driver.car_color} · {driver.car_number}
          </p>
          <p className="text-sm text-tg-hint mt-1">Мест: {driver.car_seats}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Последние заявки</h2>
          <button
            onClick={() => navigate('/driver/orders')}
            className="text-sm text-tg-button"
          >
            Смотреть все
          </button>
        </div>

        {availableCount > 0 ? (
          <div className="bg-tg-button/10 rounded-lg p-4 text-center">
            <p className="text-tg-button font-medium">
              {availableCount} новых заявок доступно
            </p>
            <button
              onClick={() => navigate('/driver/orders')}
              className="mt-2 px-4 py-2 bg-tg-button text-tg-buttonText rounded-lg text-sm"
            >
              Просмотреть
            </button>
          </div>
        ) : (
          <div className="bg-tg-bg rounded-lg p-4 text-center text-tg-hint">
            <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Нет доступных заявок</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-tg-bg border-t border-tg-hint/20 p-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center p-2 text-tg-button">
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
