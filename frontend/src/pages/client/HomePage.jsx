import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useTelegram } from '../../hooks/useTelegram'
import { MapPin, Users, Package, Car, ChevronDown } from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()
  const { tg } = useTelegram()
  const { prices, fetchPrices, fetchOnlineCount, role } = useStore()
  const [onlineCount, setOnlineCount] = useState(0)
  const [cityFrom, setCityFrom] = useState('')
  const [cityTo, setCityTo] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [uniqueCities, setUniqueCities] = useState([])

  useEffect(() => {
    fetchPrices()
    fetchOnlineCount().then(setOnlineCount)
  }, [fetchPrices, fetchOnlineCount])

  useEffect(() => {
    if (prices.length > 0) {
      const cities = new Set()
      prices.forEach(p => {
        cities.add(p.city_from)
        cities.add(p.city_to)
      })
      setUniqueCities(Array.from(cities).sort())
    }
  }, [prices])

  useEffect(() => {
    if (cityFrom && cityTo) {
      const route = prices.find(p => 
        p.city_from === cityFrom && p.city_to === cityTo
      )
      setSelectedRoute(route || null)
    }
  }, [cityFrom, cityTo, prices])

  const handleOrderTrip = () => {
    if (!selectedRoute) return
    navigate('/order/trip', { state: { route: selectedRoute } })
  }

  const handleOrderParcel = () => {
    if (!selectedRoute) return
    navigate('/order/parcel', { state: { route: selectedRoute } })
  }

  const handleOrderCar = () => {
    if (!selectedRoute) return
    navigate('/order/car', { state: { route: selectedRoute } })
  }

  return (
    <div className="min-h-screen bg-tg-secondaryBg pb-20">
      {/* Header */}
      <div className="bg-tg-bg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-tg-text">Междугороднее такси</h1>
            <p className="text-sm text-tg-hint">Быстрые и комфортные поездки</p>
          </div>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-2 text-sm ${onlineCount > 0 ? 'text-green-600' : 'text-red-500'}`}>
          <span className={`w-3 h-3 rounded-full ${onlineCount > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
          {onlineCount > 0 ? `Свободно ${onlineCount} водителей` : 'Нет свободных водителей'}
        </div>
      </div>

      {/* Route Selection */}
      <div className="p-4 bg-tg-bg mb-2">
        <h2 className="text-lg font-semibold mb-3">Выберите маршрут</h2>
        
        <div className="space-y-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-tg-hint" />
            <select
              value={cityFrom}
              onChange={(e) => setCityFrom(e.target.value)}
              className="w-full p-3 pl-10 bg-tg-secondaryBg rounded-lg appearance-none text-tg-text"
            >
              <option value="">Откуда</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-tg-hint pointer-events-none" />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-tg-hint" />
            <select
              value={cityTo}
              onChange={(e) => setCityTo(e.target.value)}
              className="w-full p-3 pl-10 bg-tg-secondaryBg rounded-lg appearance-none text-tg-text"
            >
              <option value="">Куда</option>
              {uniqueCities.filter(c => c !== cityFrom).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-tg-hint pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Prices */}
      {selectedRoute ? (
        <div className="p-4 space-y-3">
          <h2 className="text-lg font-semibold">Цены на маршрут</h2>
          
          <div className="bg-tg-bg rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-tg-button" />
              <div>
                <p className="font-medium">Поездка</p>
                <p className="text-2xl font-bold text-tg-button">
                  {selectedRoute.trip_price_per_person} ₽
                  <span className="text-sm font-normal text-tg-hint"> / чел</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-tg-bg rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-6 h-6 text-tg-button" />
              <div>
                <p className="font-medium">Посылка</p>
                <p className="text-2xl font-bold text-tg-button">
                  от {selectedRoute.parcel_min_price} ₽
                </p>
                <p className="text-sm text-tg-hint">
                  {selectedRoute.parcel_price_per_kg} ₽/кг
                </p>
              </div>
            </div>
          </div>

          <div className="bg-tg-bg rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Car className="w-6 h-6 text-tg-button" />
              <div>
                <p className="font-medium">Перегон авто</p>
                <p className="text-2xl font-bold text-tg-button">
                  {selectedRoute.car_transport_price} ₽
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-tg-hint">
          Выберите маршрут для просмотра цен
        </div>
      )}

      {/* Quick Order Buttons */}
      {selectedRoute && (
        <div className="p-4 space-y-3">
          <button
            onClick={handleOrderTrip}
            className="w-full py-4 bg-tg-button text-tg-buttonText rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Заказать поездку
          </button>
          
          <button
            onClick={handleOrderParcel}
            className="w-full py-4 bg-tg-secondaryBg text-tg-text rounded-xl font-semibold flex items-center justify-center gap-2 border border-tg-hint/20"
          >
            <Package className="w-5 h-5" />
            Отправить посылку
          </button>
          
          <button
            onClick={handleOrderCar}
            className="w-full py-4 bg-tg-secondaryBg text-tg-text rounded-xl font-semibold flex items-center justify-center gap-2 border border-tg-hint/20"
          >
            <Car className="w-5 h-5" />
            Перегон авто
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-tg-bg border-t border-tg-hint/20 p-2">
        <div className="flex justify-around">
          <button 
            onClick={() => navigate('/')}
            className="flex flex-col items-center p-2 text-tg-button"
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
