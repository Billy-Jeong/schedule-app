import { useState } from 'react'
import { Calendar, CheckSquare, Settings, LayoutDashboard, User } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState<any>(null)

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log(tokenResponse)
      setUser(tokenResponse)
      // 여기서 나중에 액세스 토큰을 사용하여 구글 API를 호출할 수 있습니다.
    },
    onError: () => console.log('Login Failed'),
    scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/tasks.readonly'
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600">Scheduler</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Calendar size={20} />} 
            label="Calendar" 
            active={activeTab === 'calendar'} 
            onClick={() => setActiveTab('calendar')} 
          />
          <NavItem 
            icon={<CheckSquare size={20} />} 
            label="Tasks" 
            active={activeTab === 'tasks'} 
            onClick={() => setActiveTab('tasks')} 
          />
        </nav>
        <div className="p-4 border-t border-gray-200">
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 capitalize">{activeTab}</h2>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full">
                <User size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Logged In</span>
              </div>
            ) : (
              <button 
                onClick={() => login()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Login with Google
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Calendar Summary */}
                <div className="lg:col-span-2 space-y-6">
                  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-md font-bold text-gray-700 mb-4">Upcoming Events</h3>
                    <div className="space-y-4">
                      <EventItem time="10:00 AM" title="Team Sync" category="Work" />
                      <EventItem time="02:30 PM" title="Design Review" category="Project" />
                      <EventItem time="05:00 PM" title="Gym Session" category="Personal" />
                    </div>
                  </section>
                </div>

                {/* Right: Tasks Summary */}
                <div className="space-y-6">
                  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-md font-bold text-gray-700 mb-4">Top Tasks</h3>
                    <div className="space-y-3">
                      <TaskItem title="Send weekly report" completed={false} />
                      <TaskItem title="Buy groceries" completed={true} />
                      <TaskItem title="Finish app prototype" completed={false} />
                    </div>
                  </section>
                </div>
              </div>
            )}
            {activeTab !== 'dashboard' && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p>This view is under development.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-t border-gray-200 flex justify-around p-3 shrink-0">
        <MobileNavItem icon={<LayoutDashboard size={24} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<Calendar size={24} />} active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <MobileNavItem icon={<CheckSquare size={24} />} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
        <MobileNavItem icon={<Settings size={24} />} active={false} />
      </nav>
    </div>
  )
}

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  )
}

function MobileNavItem({ icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 rounded-lg ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
    >
      {icon}
    </button>
  )
}

function EventItem({ time, title, category }: any) {
  return (
    <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
      <div className="text-xs font-bold text-blue-500 uppercase w-16 pt-1">{time}</div>
      <div>
        <div className="text-sm font-semibold text-gray-800">{title}</div>
        <div className="text-xs text-gray-500">{category}</div>
      </div>
    </div>
  )
}

function TaskItem({ title, completed }: any) {
  return (
    <div className="flex items-center space-x-3">
      <input type="checkbox" checked={completed} readOnly className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
      <span className={`text-sm ${completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{title}</span>
    </div>
  )
}

export default App
