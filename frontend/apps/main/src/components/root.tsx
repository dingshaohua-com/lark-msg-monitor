import { NavLink, Outlet } from 'react-router'

const NAV_ITEMS = [
  { to: '/', label: '首页' },
  { to: '/sync-report', label: '同步数据' },
  { to: '/analysis', label: '分析' },
]

export default function Root(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-6 px-6">
          <span className="text-sm font-semibold text-gray-900 select-none">Lark Monitor</span>
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm transition ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}