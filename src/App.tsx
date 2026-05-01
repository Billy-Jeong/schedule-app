import { useState, useEffect } from 'react'
import { Calendar, CheckSquare, Settings, LayoutDashboard, User, Loader2 } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setUser(tokenResponse)
      fetchEvents(tokenResponse.access_token)
    },
    onError: () => console.log('Login Failed'),
    scope: 'https://www.googleapis.com/auth/calendar.readonly'
  })

  const fetchEvents = async (accessToken: string) => {
    setLoading(true)
    try {
      const response = await axios.get(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
          },
        }
      )
      setEvents(response.data.items || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0">
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
                <span className="text-sm font-medium text-blue-700 font-sans">구글 계정 연결됨</span>
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {!user ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-500">
                <Calendar size={48} className="mb-4 opacity-20" />
                <p>일정을 확인하려면 구글 로그인이 필요합니다.</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-gray-500 text-sm">일정을 불러오는 중...</p>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-md font-bold text-gray-700 mb-4 flex items-center">
                          <Calendar size={18} className="mr-2 text-blue-500" />
                          다가오는 일정
                        </h3>
                        <div className="space-y-1">
                          {events.length > 0 ? (
                            events.map((event) => (
                              <EventItem 
                                key={event.id}
                                time={new Date(event.start.dateTime || event.start.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                title={event.summary}
                                category={event.location || '장소 미지정'}
                              />
                            ))
                          ) : (
                            <p className="text-center py-8 text-gray-400 text-sm">일정이 없습니다.</p>
                          )}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-6">
                      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-md font-bold text-gray-700 mb-4 flex items-center">
                          <CheckSquare size={18} className="mr-2 text-green-500" />
                          오늘의 할 일
                        </h3>
                        <div className="space-y-3">
                          <TaskItem title="구글 캘린더 동기화 확인" completed={true} />
                          <TaskItem title="새로운 일정 추가해보기" completed={false} />
                        </div>
                      </section>
                    </div>
                  </div>
                )}

                {activeTab === 'calendar' && (
                  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-md font-bold text-gray-700 mb-6">전체 일정 목록</h3>
                    <div className="space-y-2">
                      {events.map((event) => (
                        <div key={event.id} className="flex items-center p-4 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                          <div className="w-24 text-sm font-bold text-blue-600">
                            {new Date(event.start.dateTime || event.start.date).toLocaleDateString('ko-KR', {month: 'short', day: 'numeric'})}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{event.summary}</div>
                            <div className="text-xs text-gray-500">{event.location}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {activeTab === 'tasks' && (
                  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-md font-bold text-gray-700 mb-4">할 일 관리</h3>
                    <p className="text-sm text-gray-400">Google Tasks 연동은 다음 업데이트에서 지원될 예정입니다.</p>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-t border-gray-200 flex justify-around p-2 pb-6 shrink-0">
        <MobileNavItem icon={<LayoutDashboard size={20} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<Calendar size={20} />} active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <MobileNavItem icon={<CheckSquare size={20} />} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
        <MobileNavItem icon={<Settings size={20} />} active={false} />
      </nav>
    </div>
  )
}

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="font-semibold text-sm">{label}</span>
    </button>
  )
}

function MobileNavItem({ icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center py-2 rounded-xl ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
    >
      {icon}
    </button>
  )
}

function EventItem({ time, title, category }: any) {
  return (
    <div className="flex items-center space-x-4 p-3.5 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group">
      <div className="text-[11px] font-black text-blue-500 w-16 bg-blue-50 py-1 px-2 rounded-md text-center">{time}</div>
      <div className="flex-1">
        <div className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{title}</div>
        <div className="text-[11px] text-gray-400">{category}</div>
      </div>
    </div>
  )
}

function TaskItem({ title, completed }: any) {
  return (
    <div className="flex items-center space-x-3 p-2">
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${completed ? 'bg-green-500 border-green-500' : 'border-gray-200'}`}>
        {completed && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
      <span className={`text-sm font-medium ${completed ? 'line-through text-gray-300' : 'text-gray-600'}`}>{title}</span>
    </div>
  )
}

export default App


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
