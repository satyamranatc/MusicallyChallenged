import { NavLink, Outlet } from 'react-router-dom'
import { Music, Activity, Settings, AlignLeft, Menu } from 'lucide-react'
import { useState } from 'react'

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex font-sans selection:bg-teal-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 p-6 flex flex-col z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 mb-10 text-xl font-bold tracking-tight">
          <div className="bg-linear-to-br from-teal-400 to-emerald-500 p-2 rounded-xl shadow-lg shadow-teal-500/20">
            <Music className="text-white w-5 h-5" />
          </div>
          <span className="bg-linear-to-r from-gray-800 to-black bg-clip-text text-transparent">Sonic Flow</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { name: 'Piano', path: '/', icon: AlignLeft },
            { name: 'Guitar', path: '/guitar', icon: Activity }, 
            { name: 'Metronome', path: '/metronome', icon: Settings },
            { name: 'Drums', path: '/drums', icon: Activity },
            { name: 'AI Composer', path: '/ai', icon: Music },
          ].map(item => (
            <NavLink
              onClick={() => setIsSidebarOpen(false)}
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-teal-50 text-teal-600 shadow-[0_2px_10px_rgba(20,184,166,0.1)] border border-teal-100/50' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 relative flex flex-col min-h-screen w-full overflow-hidden bg-white/50">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center p-4 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 mr-3 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="font-bold text-gray-900 flex items-center gap-2">
            <div className="bg-teal-500 w-2 h-2 rounded-full"></div>
            Sonic Flow
          </div>
        </div>

        {/* Subtle Ambient Lights for Light Theme */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[120px] -z-10 mix-blend-multiply pointer-events-none" />
        
        <div className="flex-1 h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout;
