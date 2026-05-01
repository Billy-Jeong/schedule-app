import { useState, useEffect } from 'react'
import { Calendar, CheckSquare, Settings, LayoutDashboard, User, Loader2, Plus, X } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // 새 일정 상태
  const [newEvent, setNewEvent] = useState({
    summary: '',
    location: '',
    start: '',
    end: ''
  })

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setUser(tokenResponse)
      fetchEvents(tokenResponse.access_token)
    },
    onError: () => console.log('Login Failed'),
    scope: 'https://www.googleapis.com/auth/calendar' // 쓰기 권한을 위해 범위 확장
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
            maxResults: 15,
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

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await axios.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          summary: newEvent.summary,
          location: newEvent.location,
          start: {
            dateTime: new Date(newEvent.start).toISOString(),
            timeZone: 'Asia/Seoul',
          },
          end: {
            dateTime: new Date(newEvent.end).toISOString(),
            timeZone: 'Asia/Seoul',
          },
        },
        {
          headers: { Authorization: `Bearer ${user.access_token}` }
        }
      )
      setIsModalOpen(false)
      setNewEvent({ summary: '', location: '', start: '', end: '' })
      fetchEvents(user.access_token) // 목록 갱신
    } catch (error) {
      console.error('Error adding event:', error)
      alert('일정 추가에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">Scheduler</h1>
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
          <h2 className="text-lg font-bold text-gray-800 capitalize">{activeTab}</h2>
          <div className="flex items-center space-x-3">
            {user && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                <Plus size={20} />
              </button>
            )}
            {user ? (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                <User size={14} className="text-blue-600" />
                <span className="text-[12px] font-bold text-blue-700 uppercase tracking-tighter">CONNECTED</span>
              </div>
            ) : (
              <button 
                onClick={() => login()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
              >
                Google Login
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {!user ? (
              <div className="flex flex-col items-center justify-center h-80 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                <Calendar size={64} className="mb-6 opacity-10" />
                <p className="font-medium">일정을 관리하려면 로그인이 필요합니다.</p>
              </div>
            ) : loading && events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="animate-spin text-blue-600 mb-3" size={40} />
                <p className="text-gray-400 text-sm font-medium">동기화 중...</p>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-md font-bold text-gray-800 flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                            다가오는 일정
                          </h3>
                        </div>
                        <div className="space-y-1">
                          {events.length > 0 ? (
                            events.map((event) => (
                              <EventItem 
                                key={event.id}
                                time={new Date(event.start.dateTime || event.start.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                title={event.summary}
                                category={event.location || '장소 없음'}
                              />
                            ))
                          ) : (
                            <div className="text-center py-12 text-gray-300">
                              <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                              <p className="text-sm">등록된 일정이 없습니다.</p>
                            </div>
                          )}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-6">
                      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-md font-bold text-gray-800 mb-6 flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                          오늘의 체크리스트
                        </h3>
                        <div className="space-y-4">
                          <TaskItem title="전체 일정 확인하기" completed={true} />
                          <TaskItem title="새 일정 등록해보기" completed={false} />
                        </div>
                      </section>
                    </div>
                  </div>
                )}

                {activeTab === 'calendar' && (
                  <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-md font-bold text-gray-800 mb-8">상세 일정 목록</h3>
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div key={event.id} className="flex items-center p-5 hover:bg-gray-50 rounded-2xl border border-gray-50 hover:border-blue-100 transition-all group">
                          <div className="w-28 flex flex-col">
                            <span className="text-xs font-black text-blue-500 uppercase">
                              {new Date(event.start.dateTime || event.start.date).toLocaleDateString('ko-KR', {month: 'short', day: 'numeric'})}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">
                              {new Date(event.start.dateTime || event.start.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{event.summary}</div>
                            <div className="text-[11px] text-gray-400 font-medium">{event.location}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {activeTab === 'tasks' && (
                  <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <CheckSquare size={48} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-md font-bold text-gray-700 mb-2">Google Tasks 연동 준비 중</h3>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">다음 업데이트에서 구글 할 일 목록을 직접 관리할 수 있는 기능이 추가됩니다.</p>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 flex items-center justify-between border-b border-gray-50">
              <h3 className="text-lg font-bold text-gray-800">새 일정 추가</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase mb-1 block">일정 제목</label>
                <input 
                  type="text" required value={newEvent.summary}
                  onChange={e => setNewEvent({...newEvent, summary: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 text-sm transition-all"
                  placeholder="무엇을 하나요?"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase mb-1 block">장소 (선택)</label>
                <input 
                  type="text" value={newEvent.location}
                  onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 text-sm transition-all"
                  placeholder="어디서 하나요?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-gray-400 uppercase mb-1 block">시작 시간</label>
                  <input 
                    type="datetime-local" required value={newEvent.start}
                    onChange={e => setNewEvent({...newEvent, start: e.target.value})}
                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 text-[12px] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-gray-400 uppercase mb-1 block">종료 시간</label>
                  <input 
                    type="datetime-local" required value={newEvent.end}
                    onChange={e => setNewEvent({...newEvent, end: e.target.value})}
                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3 text-[12px] transition-all"
                  />
                </div>
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <span>구글 캘린더에 저장</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around p-3 pb-8 shrink-0">
        <MobileNavItem icon={<LayoutDashboard size={22} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<Calendar size={22} />} active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <MobileNavItem icon={<CheckSquare size={22} />} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
        <MobileNavItem icon={<Settings size={22} />} active={false} />
      </nav>
    </div>
  )
}

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all ${
        active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
      }`}
    >
      {icon}
      <span className="font-bold text-[13px]">{label}</span>
    </button>
  )
}

function MobileNavItem({ icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center py-2.5 rounded-2xl transition-all ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
    >
      {icon}
    </button>
  )
}

function EventItem({ time, title, category }: any) {
  return (
    <div className="flex items-center space-x-5 p-4 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group">
      <div className="text-[10px] font-black text-blue-600 w-16 bg-blue-50 py-1.5 px-1 rounded-lg text-center">{time}</div>
      <div className="flex-1">
        <div className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">{title}</div>
        <div className="text-[10px] text-gray-400 font-medium mt-0.5">{category}</div>
      </div>
    </div>
  )
}

function TaskItem({ title, completed }: any) {
  return (
    <div className="flex items-center space-x-4 p-1">
      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${completed ? 'bg-green-500 border-green-500' : 'border-gray-200'}`}>
        {completed && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />}
      </div>
      <span className={`text-[13px] font-bold ${completed ? 'line-through text-gray-300' : 'text-gray-600'}`}>{title}</span>
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
