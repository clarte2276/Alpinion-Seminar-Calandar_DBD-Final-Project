import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import api from '../api/client'
import styles from './MainCalendar.module.css'

// 월별 캘린더 + 일정 목록 표시
function MainCalendar() {
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const monthParam = format(currentMonth, 'yyyy-MM')

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/events', { params: { month: monthParam } })
        setEvents(res.data || [])
      } catch (err) {
        setError('일정 데이터를 불러오지 못했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [monthParam])

  const eventsByDate = useMemo(() => {
    return events.reduce((acc, evt) => {
      const key = evt.eventDate || evt.date || evt.day || ''
      if (!key) return acc
      acc[key] = acc[key] ? [...acc[key], evt] : [evt]
      return acc
    }, {})
  }, [events])

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const rows = []
    let day = startDate
    while (day <= endDate) {
      const days = []
      for (let i = 0; i < 7; i += 1) {
        const formattedDate = format(day, 'd')
        const key = format(day, 'yyyy-MM-dd')
        const dayEvents = eventsByDate[key] || []
        days.push(
          <div
            key={day.toISOString()}
            className={`${styles.cell} ${
              !isSameMonth(day, monthStart) ? styles.disabled : ''
            } ${isSameDay(day, new Date()) ? styles.today : ''}`}
          >
            <div className={styles.dateLabel}>{formattedDate}</div>
            <div className={styles.eventList}>
              {dayEvents.map((evt) => {
                const eventId = evt.id ?? evt.eventId
                return (
                  <button
                    key={eventId || `${key}-${evt.name}`}
                    className={styles.eventButton}
                    disabled={!eventId}
                    onClick={() => eventId && navigate(`/events/${eventId}`)}
                  >
                    {evt.name || evt.title || '행사'}
                  </button>
                )
              })}
            </div>
          </div>,
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div className={styles.row} key={day.toISOString()}>
          {days}
        </div>,
      )
    }
    return rows
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.monthNav}>
          <button className={styles.secondary} onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
            ◀ 이전달
          </button>
          <div className={styles.monthTitle}>
            {format(currentMonth, 'yyyy년 MM월')}
          </div>
          <button className={styles.secondary} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            다음달 ▶
          </button>
        </div>
        <button
          className={styles.primary}
          onClick={() => navigate('/events/new')}
        >
          + 새 일정
        </button>
      </div>

      {loading && <p>불러오는 중...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.weekdays}>
        {['월', '화', '수', '목', '금', '토', '일'].map((dayName) => (
          <div key={dayName}>{dayName}</div>
        ))}
      </div>

      <div className={styles.grid}>{renderCells()}</div>
    </div>
  )
}

export default MainCalendar
