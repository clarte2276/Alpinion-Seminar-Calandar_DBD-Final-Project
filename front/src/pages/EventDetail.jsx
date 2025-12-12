import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import styles from './EventDetail.module.css'

const toDateTimeValue = (value) => {
  if (!value) return ''
  const str = String(value).replace(' ', 'T')
  return str.length > 16 ? str.slice(0, 16) : str
}

const toDate = (value, type = 'datetime') => {
  if (!value) return null
  const str = String(value)
  const candidate = type === 'time' && !str.includes('T') ? `1970-01-01T${str}` : str
  const d = new Date(candidate)
  return Number.isNaN(d.getTime()) ? null : d
}

const formatKoreanTime = (value) => {
  const d = toDate(value, 'time')
  if (!d) return '-'
  const h = d.getHours()
  const m = d.getMinutes()
  const period = h < 12 ? '오전' : '오후'
  const hh = String(h % 12 || 12).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  return `${period} ${hh}시 ${mm}분`
}

const formatKoreanDateTime = (value) => {
  const d = toDate(value)
  if (!d) return '-'
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const h = d.getHours()
  const m = d.getMinutes()
  const period = h < 12 ? '오전' : '오후'
  const hh = String(h % 12 || 12).padStart(2, '0')
  const mins = String(m).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${period} ${hh}시 ${mins}분`
}

function EventDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [eventData, setEventData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [cloning, setCloning] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/events/${eventId}`)
        const raw = res.data || {}
        const rawShipment = raw.shipment
        const shipment = rawShipment
          ? {
              driverName: rawShipment.DriverName || rawShipment.driverName || '',
              expectShipmentTime: toDateTimeValue(
                rawShipment.ExpectShipmentTime || rawShipment.expectShipmentTime || rawShipment.shipmentTime,
              ),
              expectArriveTime: toDateTimeValue(
                rawShipment.ExpectArriveTime || rawShipment.expectArriveTime || rawShipment.arriveTime,
              ),
              realShipmentTime: toDateTimeValue(rawShipment.RealShipmentTime || rawShipment.realShipmentTime),
              realArriveTime: toDateTimeValue(rawShipment.RealArriveTime || rawShipment.realArriveTime),
            }
          : null
        setEventData({ ...raw, shipment })
      } catch (err) {
        setError('행사 정보를 불러오지 못했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const handleFieldChange = (field, value) => {
    setEventData((prev) => ({ ...prev, [field]: value }))
  }

  const updateListQuantity = (listKey, index, quantity) => {
    setEventData((prev) => {
      const list = prev?.[listKey] || []
      const nextList = list.map((item, idx) => (idx === index ? { ...item, quantity: Math.max(0, quantity) } : item))
      return { ...prev, [listKey]: nextList }
    })
  }

  const updateItemQuantity = (index, quantity) => {
    setEventData((prev) => {
      const list = prev?.items || []
      const next = list.map((item, idx) => (idx === index ? { ...item, quantity: Math.max(0, quantity) } : item))
      return { ...prev, items: next }
    })
  }

  const updatePartTimeWorker = (index, field, value) => {
    setEventData((prev) => {
      const list = prev?.partTimeWorkers || []
      const next = list.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
      return { ...prev, partTimeWorkers: next }
    })
  }

  const updateShipmentField = (field, value) => {
    setEventData((prev) => ({
      ...prev,
      shipment: { ...(prev?.shipment || {}), [field]: value },
    }))
  }

  const buildUpdatePayload = () => {
    if (!eventData) return null
    const {
      name,
      eventDate,
      time,
      location,
      type,
      participantCount,
      organizationName,
      remark,
      ultraSounds = [],
      probes = [],
      items = [],
      employees = [],
      partTimeWorkers = [],
      shipment,
    } = eventData

    return {
      event: {
        name,
        eventDate,
        eventTime: time,
        location: location || null,
        type: type || null,
        participantCount: Number(participantCount) || 0,
        organizationName: organizationName || null,
        remark: remark || null,
      },
      ultraSounds: ultraSounds.map((u) => ({ name: u.name, quantity: u.quantity || 0 })),
      probes: probes.map((p) => ({ name: p.name, quantity: p.quantity || 0 })),
      items: items.map((item) => ({
        eventItemId: item.eventItemId || item.id || null,
        customItemName: item.customItemName || null,
        quantity: item.quantity || 0,
      })),
      employees: employees
        .map((emp) => ({
          employeeId: emp.employeeId || emp.id,
          role: emp.role || emp.position || null,
        }))
        .filter((emp) => emp.employeeId),
      partTimeWorkers: partTimeWorkers
        .map((pt) => ({
          partTimeWorkerId: pt.partTimeWorkerId || pt.id,
          workHours: pt.workHours || pt.hours || 0,
        }))
        .filter((pt) => pt.partTimeWorkerId),
      shipment: shipment
        ? {
            driverName: shipment.driverName || null,
            expectShipmentTime: shipment.expectShipmentTime || shipment.shipmentTime || null,
            expectArriveTime: shipment.expectArriveTime || shipment.arriveTime || null,
            realShipmentTime: shipment.realShipmentTime || null,
            realArriveTime: shipment.realArriveTime || null,
          }
        : undefined,
    }
  }

  const handleSave = async () => {
    if (!eventData) return
    setSaving(true)
    setError('')
    try {
      const payload = buildUpdatePayload()
      const res = await api.put(`/events/${eventId}`, payload)
      setEventData(res.data?.event || eventData)
      setEditing(false)
    } catch (err) {
      setError('저장에 실패했습니다.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!eventId) return
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?')
    if (!confirmDelete) return

    setDeleting(true)
    setError('')
    try {
      await api.delete(`/events/${eventId}`)
      navigate('/')
    } catch (err) {
      setError('일정 삭제에 실패했습니다.')
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const handleClone = async () => {
    if (!eventId) return
    setCloning(true)
    setError('')
    try {
      const res = await api.post(`/events/${eventId}/clone`)
      const newId = res.data?.eventId || res.data?.id
      navigate(newId ? `/events/${newId}` : '/')
    } catch (err) {
      setError('일정 복제에 실패했습니다.')
      console.error(err)
    } finally {
      setCloning(false)
    }
  }

  if (loading) return <p>불러오는 중...</p>
  if (error) return <p className={styles.error}>{error}</p>
  if (!eventData) return <p>데이터가 없습니다.</p>

  const {
    name,
    eventDate,
    time,
    location,
    participantCount,
    remark,
    ultraSounds = eventData.ultraSounds || [],
    probes = [],
    items = eventData.items || [],
    employees = [],
    partTimeWorkers = [],
    shipment = null,
  } = eventData

  const itemsWithIndex = (items || []).map((item, idx) => ({ ...item, __idx: idx }))

  const displayDate = eventDate
  const displayTime = formatKoreanTime(time)
  const basicItems = itemsWithIndex.filter((item) => item.itemType === '기본' || item.type === '기본')
  const otherItems = itemsWithIndex.filter((item) => item.itemType !== '기본' && item.type !== '기본')

  const groupedEmployees = employees.reduce((acc, emp) => {
    const key = emp.employeeType || emp.type || '기타'
    acc[key] = acc[key] ? [...acc[key], emp] : [emp]
    return acc
  }, {})

  const itemName = (item) => item.customItemName || item.name || item.itemName || '이름 없음'

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{name || '행사 상세'}</h2>
        <div className={styles.actions}>
          <button onClick={() => navigate(-1)}>뒤로</button>
          <button className={styles.primary} onClick={() => navigate(`/events/${eventId}/edit`)}>
            수정
          </button>
          <button onClick={handleClone} disabled={cloning || saving || deleting}>
            {cloning ? '복제 중...' : '복제'}
          </button>
          <button className={styles.danger} onClick={handleDelete} disabled={deleting || saving}>
            {deleting ? '삭제 중...' : '삭제'}
          </button>
          {editing && (
            <button className={styles.primary} onClick={handleSave} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
          )}
        </div>
      </div>

      <section className={styles.section}>
        <h3>행사 기본 정보</h3>
        <div className={styles.fields}>
          <label>
            이름
            {editing ? (
              <input value={name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} />
            ) : (
              <span>{name}</span>
            )}
          </label>
          <label>
            날짜
            {editing ? (
              <input type="date" value={displayDate || ''} onChange={(e) => handleFieldChange('eventDate', e.target.value)} />
            ) : (
              <span>{displayDate}</span>
            )}
          </label>
          <label>
            시간
            {editing ? (
              <input type="time" value={time || ''} onChange={(e) => handleFieldChange('time', e.target.value)} />
            ) : (
              <span>{displayTime}</span>
            )}
          </label>
          <label>
            장소
            {editing ? (
              <input value={location || ''} onChange={(e) => handleFieldChange('location', e.target.value)} />
            ) : (
              <span>{location}</span>
            )}
          </label>
          <label>
            예상 참석자
            {editing ? (
              <input
                type="number"
                value={participantCount || 0}
                onChange={(e) => handleFieldChange('participantCount', Number(e.target.value))}
              />
            ) : (
              <span>{participantCount} 명</span>
            )}
          </label>
          <label className={styles.fullRow}>
            비고
            {editing ? (
              <textarea rows={3} value={remark || ''} onChange={(e) => handleFieldChange('remark', e.target.value)} />
            ) : (
              <span>{remark}</span>
            )}
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h3>초음파 장비 (UltraSound)</h3>
        <ul>
          {ultraSounds.map((item, idx) => (
            <li key={item.id || item.ultraSoundId || idx}>
              {item.name}{' '}
              {editing ? (
                <input
                  type="number"
                  min="0"
                  value={item.quantity || 0}
                  onChange={(e) => updateListQuantity('ultraSounds', idx, Number(e.target.value))}
                  className={styles.inlineInput}
                />
              ) : (
                <>× {item.quantity}</>
              )}
            </li>
          ))}
          {!ultraSounds.length && <li>등록된 장비가 없습니다.</li>}
        </ul>
      </section>

      <section className={styles.section}>
        <h3>프로브</h3>
        <ul>
          {probes.map((item, idx) => (
            <li key={item.id || item.probeId || idx}>
              {item.name}{' '}
              {editing ? (
                <input
                  type="number"
                  min="0"
                  value={item.quantity || 0}
                  onChange={(e) => updateListQuantity('probes', idx, Number(e.target.value))}
                  className={styles.inlineInput}
                />
              ) : (
                <>× {item.quantity}</>
              )}
            </li>
          ))}
          {!probes.length && <li>등록된 프로브가 없습니다.</li>}
        </ul>
      </section>

      <section className={styles.section}>
        <h3>기본 물품</h3>
        <ul>
          {basicItems.map((item) => (
            <li key={item.id || item.eventItemId || item.__idx}>
              {itemName(item)}{' '}
              {editing ? (
                <input
                  type="number"
                  min="0"
                  value={item.quantity || 0}
                  onChange={(e) => updateItemQuantity(item.__idx, Number(e.target.value))}
                  className={styles.inlineInput}
                />
              ) : (
                <>× {item.quantity}</>
              )}
            </li>
          ))}
          {!basicItems.length && <li>기본 물품이 없습니다.</li>}
        </ul>
      </section>

      <section className={styles.section}>
        <h3>기타/추가 물품</h3>
        <ul>
          {otherItems.map((item) => (
            <li key={item.id || item.eventItemId || item.__idx}>
              {itemName(item)}{' '}
              {editing ? (
                <input
                  type="number"
                  min="0"
                  value={item.quantity || 0}
                  onChange={(e) => updateItemQuantity(item.__idx, Number(e.target.value))}
                  className={styles.inlineInput}
                />
              ) : (
                <>× {item.quantity}</>
              )}
            </li>
          ))}
          {!otherItems.length && <li>추가 물품이 없습니다.</li>}
        </ul>
      </section>

      <section className={styles.section}>
        <h3>인력 배정</h3>
        {Object.keys(groupedEmployees).map((type) => (
          <div key={type}>
            <strong>{type}</strong>
            <ul>
              {groupedEmployees[type].map((emp) => (
                <li key={emp.id || emp.employeeId}>{emp.name}</li>
              ))}
            </ul>
          </div>
        ))}
        {!employees.length && <p>인력이 없습니다.</p>}
      </section>

      <section className={styles.section}>
        <h3>아르바이트 배정</h3>
        <ul>
          {partTimeWorkers.map((pt, idx) => (
            <li key={pt.id || pt.partTimeWorkerId || idx}>
              {pt.name} /{' '}
              {editing ? (
                <input
                  type="number"
                  min="0"
                  value={pt.workHours || pt.hours || 0}
                  onChange={(e) => updatePartTimeWorker(idx, 'workHours', Number(e.target.value))}
                  className={styles.inlineInput}
                />
              ) : (
                `${pt.workHours || pt.hours || 0} 시간`
              )}
            </li>
          ))}
          {!partTimeWorkers.length && <li>등록된 아르바이트가 없습니다.</li>}
        </ul>
      </section>

      <section className={styles.section}>
        <h3>장비 출발/도착 정보</h3>
        <ul>
          {shipment ? (
            <li>
              기사:{' '}
              {editing ? (
                <input
                  value={shipment.driverName || ''}
                  onChange={(e) => updateShipmentField('driverName', e.target.value)}
                  className={styles.inlineInput}
                />
              ) : (
                shipment.driverName || '-'
              )}{' '}
              / 출발:{' '}
              {editing ? (
                <input
                  type="datetime-local"
                  value={shipment.expectShipmentTime || shipment.shipmentTime || ''}
                  onChange={(e) => updateShipmentField('expectShipmentTime', e.target.value)}
                  className={styles.inlineInput}
                />
              ) : (
                formatKoreanDateTime(shipment.expectShipmentTime || shipment.shipmentTime)
              )}{' '}
              / 도착:{' '}
              {editing ? (
                <input
                  type="datetime-local"
                  value={shipment.expectArriveTime || shipment.arriveTime || ''}
                  onChange={(e) => updateShipmentField('expectArriveTime', e.target.value)}
                  className={styles.inlineInput}
                />
              ) : (
                formatKoreanDateTime(shipment.expectArriveTime || shipment.arriveTime)
              )}
            </li>
          ) : (
            <li>출발/도착 정보가 없습니다.</li>
          )}
        </ul>
      </section>
    </div>
  )
}

export default EventDetail
