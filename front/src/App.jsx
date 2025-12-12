import { Link, Route, Routes } from 'react-router-dom'
import MainCalendar from './pages/MainCalendar'
import EventDetail from './pages/EventDetail'
import EventForm from './pages/EventForm'
import AdminHome from './pages/AdminHome'
import AdminResource from './pages/AdminResource'
import './App.css'

// Top-level layout + router outlet.
function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand">
          행사/장비 일정 관리
        </Link>
        <nav className="nav">
          <Link to="/">캘린더</Link>
          <Link to="/events/new">새 일정</Link>
          <Link to="/admin">관리자</Link>
        </nav>
      </header>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<MainCalendar />} />
          <Route path="/events/new" element={<EventForm />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/events/:eventId/edit" element={<EventForm mode="edit" />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/:resource" element={<AdminResource />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
