import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/api'
import { ChevronLeft, TrendingUp, Users, DollarSign, Route, BarChart3 } from 'lucide-react'

export default function AdminStatsPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [driverStats, setDriverStats] = useState([])
  const [routeStats, setRouteStats] = useState([])
  const [chartData, setChartData] = useState([])
  const [period, setPeriod] = useState('today')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      const [overviewRes, driversRes, routesRes, chartRes] = await Promise.all([
        api.get(`/stats/overview?period=${period}`),
        api.get('/stats/drivers'),
        api.get('/stats/routes'),
        api.get('/stats/chart?days=30')
      ])
      
      setOverview(overviewRes.data)
      setDriverStats(driversRes.data)
      setRouteStats(routesRes.data)
      setChartData(chartRes.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-tg-secondaryBg">
      {/* Header */}
      <div className="bg-tg-bg p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/admin')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Статистика</h1>
      </div>

      {/* Period Selector */}
      <div className="p-4">
        <div className="flex gap-2">
          {[
            { key: 'today', label: 'Сегодня' },
            { key: 'week', label: 'Неделя' },
            { key: 'month', label: 'Месяц' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                period === key 
                  ? 'bg-tg-button text-tg-buttonText' 
                  : 'bg-tg-bg text-tg-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="px-4 grid grid-cols-2 gap-3 mb-4">
          <div className="bg-tg-bg rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-tg-hint">Всего заказов</span>
            </div>
            <p className="text-2xl font-bold">{overview.orders?.total || 0}</p>
            <div className="flex gap-2 mt-1 text-xs text-tg-hint">
              <span>🚗 {overview.orders?.trips || 0}</span>
              <span>📦 {overview.orders?.parcels || 0}</span>
              <span>🚙 {overview.orders?.car_transports || 0}</span>
            </div>
          </div>

          <div className="bg-tg-bg rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-sm text-tg-hint">Выручка</span>
            </div>
            <p className="text-2xl font-bold">{overview.orders?.total_revenue || 0} ₽</p>
            <p className="text-xs text-tg-hint mt-1">
              {overview.orders?.completed || 0} выполнено
            </p>
          </div>

          <div className="bg-tg-bg rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-tg-hint">Водители</span>
            </div>
            <p className="text-2xl font-bold">{overview.drivers?.total || 0}</p>
            <div className="flex gap-2 mt-1 text-xs text-tg-hint">
              <span className="text-green-600">🟢 {overview.drivers?.online || 0}</span>
              <span className="text-gray-500">⚪ {overview.drivers?.total - overview.drivers?.online || 0}</span>
            </div>
          </div>

          <div className="bg-tg-bg rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-tg-hint">Конверсия</span>
            </div>
            <p className="text-2xl font-bold">
              {overview.orders?.total > 0 
                ? Math.round((overview.orders?.completed / overview.orders?.total) * 100) 
                : 0}%
            </p>
            <p className="text-xs text-tg-hint mt-1">
              {overview.orders?.cancelled || 0} отмен
            </p>
          </div>
        </div>
      )}

      {/* Top Drivers */}
      <div className="px-4 mb-4">
        <h2 className="text-lg font-semibold mb-3">Топ водителей</h2>
        <div className="bg-tg-bg rounded-lg shadow-sm overflow-hidden">
          {driverStats.slice(0, 5).map((driver, index) => (
            <div 
              key={driver.id} 
              className={`flex items-center justify-between p-3 ${
                index < 4 ? 'border-b border-tg-hint/20' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-tg-secondaryBg text-tg-hint'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium">{driver.full_name}</p>
                  <p className="text-xs text-tg-hint">
                    ⭐ {parseFloat(driver.rating).toFixed(1)} · {driver.completed_orders} заказов
                  </p>
                </div>
              </div>
              <p className="font-semibold">{driver.total_earnings} ₽</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Routes */}
      <div className="px-4 mb-4">
        <h2 className="text-lg font-semibold mb-3">Популярные маршруты</h2>
        <div className="bg-tg-bg rounded-lg shadow-sm overflow-hidden">
          {routeStats.slice(0, 5).map((route, index) => (
            <div 
              key={`${route.city_from}-${route.city_to}`} 
              className={`flex items-center justify-between p-3 ${
                index < 4 ? 'border-b border-tg-hint/20' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Route className="w-5 h-5 text-tg-hint" />
                <p className="font-medium">{route.city_from} → {route.city_to}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{route.total_orders}</p>
                <p className="text-xs text-tg-hint">{route.total_revenue} ₽</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Chart */}
      <div className="px-4 pb-4">
        <h2 className="text-lg font-semibold mb-3">Заказы по дням</h2>
        <div className="bg-tg-bg rounded-lg p-4 shadow-sm">
          <div className="flex items-end gap-1 h-32">
            {chartData.slice(-14).map((day, index) => {
              const maxOrders = Math.max(...chartData.map(d => parseInt(d.orders)), 1)
              const height = (day.orders / maxOrders) * 100
              return (
                <div 
                  key={index} 
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div 
                    className="w-full bg-tg-button/20 rounded-t"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  >
                    <div 
                      className="w-full bg-tg-button rounded-t transition-all"
                      style={{ height: `${(day.completed / day.orders) * 100}%`, minHeight: day.completed > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-xs text-tg-hint">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-tg-hint mt-2">
            <span>🔵 Всего</span>
            <span className="text-tg-button">🟢 Выполнено</span>
          </div>
        </div>
      </div>
    </div>
  )
}
