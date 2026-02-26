import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { MapPin, Users, Package, ChevronLeft } from 'lucide-react'

export default function DriversPage() {
  const navigate = useNavigate()
  const { onlineDrivers, fetchOnlineDrivers } = useStore()

  useEffect(() => {
    fetchOnlineDrivers()
  }, [fetchOnlineDrivers])

  const calculateAge = (birthYear) => {
    if (!birthYear) return null
    return new Date().getFullYear() - birthYear
  }

  return (
    <div className="min-h-screen bg-tg-secondaryBg pb-20">
      {/* Header */}
      <div className="bg-tg-bg p-4 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Свободные водители ({onlineDrivers.length})</h1>
      </div>

      {/* Drivers List */}
      {onlineDrivers.length > 0 ? (
        <div className="p-4 space-y-3">
          {onlineDrivers.map(driver => (
            <div key={driver.id} className="bg-tg-bg rounded-lg p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-full bg-tg-secondaryBg flex items-center justify-center flex-shrink-0">
                  {driver.photo_url ? (
                    <img 
                      src={driver.photo_url} 
                      alt={driver.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-8 h-8 text-tg-hint" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold truncate">{driver.full_name}</h3>
                      <div className="flex items-center gap-1 text-sm text-tg-hint">
                        <span>⭐ {parseFloat(driver.rating).toFixed(1)}</span>
                        {calculateAge(driver.birth_year) && (
                          <span>· {calculateAge(driver.birth_year)} лет</span>
                        )}
                      </div>
                    </div>
                    {driver.can_transport_car && (
                      <span className="text-lg" title="Может перегонять авто">🚗</span>
                    )}
                  </div>
                  
                  <div className="mt-2 text-sm text-tg-hint">
                    <p>Стаж: {driver.experience_years} лет</p>
                    <p className="truncate">
                      {driver.car_brand} {driver.car_model}, {driver.car_year}
                    </p>
                    <p>Цвет: {driver.car_color} · Мест: {driver.car_seats}</p>
                  </div>
                  
                  <div className="mt-2 text-xs text-tg-hint">
                    {driver.total_trips} поездок
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Users className="w-16 h-16 text-tg-hint mb-4" />
          <p className="text-tg-hint">
            Сейчас нет свободных водителей.
            <br />Попробуйте позже или оставьте заявку.
          </p>
        </div>
      )}

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
            className="flex flex-col items-center p-2 text-tg-button"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Водители</span>
          </button>
          <button 
            onClick={() => navigate('/orders')}
            className="flex flex-col items-center p-2 text-tg-hint"
          >
            <Package className="w-6 h-6" />
            <span className="text-xs mt-1">Заказы</span>
          </button>
        </div>
      </div>
    </div>
  )
}
