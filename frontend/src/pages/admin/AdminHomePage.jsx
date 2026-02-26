import { useNavigate } from 'react-router-dom'
import { BarChart3, Users, DollarSign, ClipboardList, Settings, ChevronRight } from 'lucide-react'

export default function AdminHomePage() {
  const navigate = useNavigate()

  const menuItems = [
    {
      icon: BarChart3,
      label: 'Статистика',
      description: 'Общая аналитика и графики',
      path: '/admin/stats',
      color: 'text-blue-500'
    },
    {
      icon: Users,
      label: 'Водители',
      description: 'Управление водителями',
      path: '/admin/drivers',
      color: 'text-green-500'
    },
    {
      icon: DollarSign,
      label: 'Цены',
      description: 'Тарифы и маршруты',
      path: '/admin/prices',
      color: 'text-yellow-500'
    },
    {
      icon: ClipboardList,
      label: 'Заказы',
      description: 'Все заказы системы',
      path: '/admin/orders',
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="min-h-screen bg-tg-secondaryBg">
      {/* Header */}
      <div className="bg-tg-bg p-4 shadow-sm">
        <h1 className="text-xl font-bold">Панель администратора</h1>
        <p className="text-sm text-tg-hint">Управление системой</p>
      </div>

      {/* Menu */}
      <div className="p-4 space-y-3">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="w-full bg-tg-bg rounded-lg p-4 flex items-center gap-4 shadow-sm"
          >
            <div className={`p-3 rounded-xl bg-tg-secondaryBg ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">{item.label}</p>
              <p className="text-sm text-tg-hint">{item.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-tg-hint" />
          </button>
        ))}
      </div>
    </div>
  )
}
