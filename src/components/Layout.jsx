import Sidebar from './Sidebar'

export default function Layout({ breadcrumb, title, subtitle, actions, children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 py-6 max-w-[1400px]">
        {breadcrumb && (
          <div className="text-xs text-gray-400 mb-1">{breadcrumb}</div>
        )}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  )
}
