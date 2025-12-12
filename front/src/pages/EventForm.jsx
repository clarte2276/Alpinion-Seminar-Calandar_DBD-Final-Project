import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import styles from './EventForm.module.css'

const BASIC_ITEM_RULES = [
  { name: '휴지', perUltrasound: 1 },
  { name: '젤', perUltrasound: 2 },
  { name: '물티슈', perUltrasound: 1 },
  { name: '멀티탭', perUltrasound: 1 },
  { name: '비닐봉지', perUltrasound: 1 },
]

const normalizeUltrasounds = (rows = []) =>
  rows
    .map((row) => ({
      id:
        row.id ||
        row.UltraSoundId ||
        row.UltraSoundID ||
        row.ultraSoundId ||
        row.ultraSoundID ||
        row.UltraSoundName ||
        row.ultraSoundName ||
        row.Name ||
        row.name,
      name: row.Name || row.name || row.UltraSoundName || row.ultraSoundName || '',
      price: row.Price ?? row.price ?? null,
      specification: row.Specification || row.specification || '',
    }))
    .filter((item) => item.id)

const normalizeProbes = (rows = []) =>
  rows
    .map((row) => ({
      id: row.id || row.ProbeId || row.ProbeID || row.probeId || row.Name || row.name,
      name: row.Name || row.name || '',
      type: row.Type || row.type || '',
      application: row.Application || row.application || '',
    }))
    .filter((item) => item.id)

const normalizeEventItems = (rows = []) =>
  rows
    .map((row) => ({
      id: row.EventItemID ?? row.eventItemId ?? row.id,
      itemType: row.ItemType || row.itemType || '',
      name: row.ItemName || row.itemName || row.name || '',
      maxQuantity: row.MaxQuantity ?? row.maxQuantity ?? null,
    }))
    .filter((item) => item.id)

const normalizeEmployees = (rows = []) =>
  rows
    .map((row) => ({
      id: row.EmployeeID ?? row.employeeId ?? row.id,
      name: row.Name || row.name || '',
      position: row.Position || row.position || '',
      team: row.Team || row.team || '',
      organizationName: row.OrganizationName || row.organizationName || '',
      contact: row.Contact || row.contact || '',
      type: row.EmployeeType || row.employeeType || row.type || '',
    }))
    .filter((item) => item.id)

const normalizePartTimers = (rows = []) =>
  rows
    .map((row) => ({
      id: row.PartTimeWorkerID ?? row.partTimeWorkerId ?? row.id,
      name: row.Name || row.name || '',
      age: row.Age ?? row.age ?? '',
      gender: row.Gender || row.gender || '',
      accountNumber: row.AccountNumber || row.accountNumber || '',
    }))
    .filter((item) => item.id)

const normalizeName = (value) => (value || '').toString().toLowerCase()

const AUTO_PROBE_ULTRASOUND_KEYWORDS = ['60', '70', '90']
const AUTO_PROBE_TARGET_NAMES = ['sl3-19x', 'sc1-7h']

function EventForm({ mode = 'create' }) {
  const { eventId } = useParams()
  const isEdit = mode === 'edit' && eventId
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    participantCount: 0,
    remark: '',
  })

  const [ultrasoundList, setUltrasoundList] = useState([])
  const [probeList, setProbeList] = useState([])
  const [compatibilityMap, setCompatibilityMap] = useState({})
  const [eventItems, setEventItems] = useState([])
  const [employees, setEmployees] = useState([])
  const [partTimers, setPartTimers] = useState([])

  const [equipment, setEquipment] = useState({})
  const [probeSelection, setProbeSelection] = useState({})
  const [manuallyAllowedProbeIds, setManuallyAllowedProbeIds] = useState(new Set())
  const [showExtraProbeModal, setShowExtraProbeModal] = useState(false)
  const [extraProbeSelection, setExtraProbeSelection] = useState({})
  const [optionalSelection, setOptionalSelection] = useState({})
  const [employeeSelection, setEmployeeSelection] = useState({})
  const [assignedPartTimers, setAssignedPartTimers] = useState([])
  const [customItems, setCustomItems] = useState([{ name: '', quantity: 0 }])
  const [shipment, setShipment] = useState({
    driverName: '',
    expectShipmentTime: '',
    expectArriveTime: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const hydrateFromEvent = (evt, ctx) => {
    if (!evt) return
    setForm({
      name: evt.name || '',
      date: evt.eventDate || '',
      time: evt.time || '',
      location: evt.location || '',
      participantCount: evt.participantCount || 0,
      remark: evt.remark || '',
    })

    const nextEquipment = {}
    ;(evt.ultraSounds || []).forEach((item) => {
      const found = (ctx.ultrasounds || []).find((u) => normalizeName(u.name) === normalizeName(item.name))
      const key = found?.id ?? item.name
      if (key) nextEquipment[key] = item.quantity || 0
    })
    setEquipment(nextEquipment)

    const nextProbes = {}
    ;(evt.probes || []).forEach((item) => {
      const found = (ctx.probes || []).find((p) => normalizeName(p.name) === normalizeName(item.name))
      const key = found?.id ?? item.name
      if (key) nextProbes[key] = item.quantity || 0
    })
    setProbeSelection(nextProbes)
    setManuallyAllowedProbeIds(new Set(Object.keys(nextProbes).map(String)))

    const basicNames = new Set(BASIC_ITEM_RULES.map((i) => i.name))
    const nextOptional = {}
    const customRows = []
    ;(evt.items || []).forEach((item) => {
      const id = item.eventItemId || item.id
      const name = item.itemName || item.name
      if (item.customItemName && !id) {
        customRows.push({ name: item.customItemName, quantity: item.quantity || 0 })
        return
      }
      if (name && basicNames.has(name)) return
      if (id) {
        nextOptional[id] = { checked: true, quantity: item.quantity || 0 }
      }
    })
    setOptionalSelection(nextOptional)
    setCustomItems(customRows.length ? [...customRows, { name: '', quantity: 0 }] : [{ name: '', quantity: 0 }])

    const nextEmployees = {}
    ;(evt.employees || []).forEach((emp) => {
      const id = emp.employeeId || emp.id
      if (id) nextEmployees[id] = true
    })
    setEmployeeSelection(nextEmployees)

    setAssignedPartTimers(
      (evt.partTimeWorkers || []).map((pt) => ({
        partTimeWorkerId: pt.partTimeWorkerId || pt.id || null,
        workHours: Number(pt.workHours || pt.hours || 0),
      })),
    )

    if (evt.shipment) {
      setShipment({
        driverName: evt.shipment.driverName || '',
        expectShipmentTime: evt.shipment.expectShipmentTime || evt.shipment.shipmentTime || '',
        expectArriveTime: evt.shipment.expectArriveTime || evt.shipment.arriveTime || '',
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const detailPromise = isEdit ? api.get(`/events/${eventId}`) : Promise.resolve(null)
        const [
          ultrasoundRes,
          probeRes,
          compatRes,
          eventItemRes,
          employeeRes,
          partTimerRes,
          detailRes,
        ] = await Promise.all([
          api.get('/admin/ultrasounds'),
          api.get('/admin/probes'),
          api.get('/admin/ultrasound-probe-compatibility'),
          api.get('/admin/event-items'),
          api.get('/admin/employees'),
          api.get('/admin/part-time-workers'),
          detailPromise,
        ])

        const normalizedUltrasounds = normalizeUltrasounds(ultrasoundRes.data || [])
        const normalizedProbes = normalizeProbes(probeRes.data || [])
        const normalizedEventItems = normalizeEventItems(eventItemRes.data || [])
        const normalizedEmployees = normalizeEmployees(employeeRes.data || [])
        const normalizedPartTimers = normalizePartTimers(partTimerRes.data || [])

        setUltrasoundList(normalizedUltrasounds)
        setProbeList(normalizedProbes)
        const compatRows = compatRes.data || []
        const map = compatRows.reduce((acc, row) => {
          const us = (row.UltraSoundName || row.ultraSoundName || row.ultrasoundName || '').toLowerCase()
          const pb = (row.ProbeName || row.probeName || '').toLowerCase()
          if (!us || !pb) return acc
          acc[us] = acc[us] || new Set()
          acc[us].add(pb)
          return acc
        }, {})
        setCompatibilityMap(map)
        setEventItems(normalizedEventItems)
        setEmployees(normalizedEmployees)
        setPartTimers(normalizedPartTimers)

        if (isEdit && detailRes?.data) {
          hydrateFromEvent(detailRes.data, {
            ultrasounds: normalizedUltrasounds,
            probes: normalizedProbes,
            eventItems: normalizedEventItems,
          })
        }
      } catch (err) {
        setError('필수 데이터를 불러오지 못했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isEdit, eventId])

  const adjustAutoProbes = useCallback(
    (delta) => {
      if (!delta) return
      const targetIds = AUTO_PROBE_TARGET_NAMES.map(
        (name) => probeList.find((p) => normalizeName(p.name) === name)?.id,
      ).filter(Boolean)

      if (!targetIds.length) return

      setProbeSelection((prev) => {
        const next = { ...prev }
        targetIds.forEach((pid) => {
          next[pid] = Math.max(0, (next[pid] || 0) + delta)
        })
        return next
      })

      if (delta > 0) {
        setManuallyAllowedProbeIds((prev) => {
          const next = new Set(prev)
          targetIds.forEach((pid) => next.add(String(pid)))
          return next
        })
      }
    },
    [probeList],
  )

  const isAutoProbeUltrasound = useCallback((name) => {
    const n = normalizeName(name)
    return AUTO_PROBE_ULTRASOUND_KEYWORDS.some((keyword) => n.includes(keyword))
  }, [])

  const handleEquipment = (id, delta) => {
    if (!delta) return
    setEquipment((prev) => {
      const next = { ...prev }
      next[id] = Math.max(0, (next[id] || 0) + delta)
      return next
    })

    const us = ultrasoundList.find((item) => String(item.id) === String(id))
    if (us && isAutoProbeUltrasound(us.name)) {
      adjustAutoProbes(delta)
    }
  }

  const handleProbe = (id, delta) => {
    setProbeSelection((prev) => {
      const next = { ...prev }
      next[id] = Math.max(0, (next[id] || 0) + delta)
      return next
    })
  }

  const selectedUltrasoundIds = useMemo(
    () => Object.entries(equipment).filter(([, qty]) => qty > 0).map(([id]) => id),
    [equipment],
  )

  const probeMatchesUltrasound = useCallback((us, probe) => {
    const usKey = normalizeName(us?.name)
    const pbKey = normalizeName(probe?.name)

    if (compatibilityMap[usKey]) {
      return compatibilityMap[usKey].has(pbKey)
    }

    const usSpec = normalizeName(us?.specification)
    const pType = normalizeName(probe?.type)
    const pSpec = normalizeName(probe?.application)

    if (!usSpec || (!pType && !pSpec)) return false

    return (
      (pType && usSpec.includes(pType)) ||
      (pSpec && usSpec.includes(pSpec)) ||
      (pType && pSpec && pType.includes(pSpec)) ||
      (pSpec && pType && pSpec.includes(pType))
    )
  }, [compatibilityMap])

  const compatibleProbeIds = useMemo(() => {
    const ids = new Set()
    const hasSelection = selectedUltrasoundIds.length > 0

    probeList.forEach((probe) => {
      if (!hasSelection) {
        ids.add(String(probe.id))
        return
      }

      const matched = selectedUltrasoundIds.some((uid) => {
        const us = ultrasoundList.find((item) => String(item.id) === String(uid))
        return probeMatchesUltrasound(us, probe)
      })

      if (matched) ids.add(String(probe.id))
    })

    return ids
  }, [probeList, selectedUltrasoundIds, ultrasoundList, probeMatchesUltrasound])

  const visibleProbes = useMemo(
    () => probeList.filter((p) => compatibleProbeIds.has(String(p.id)) || manuallyAllowedProbeIds.has(String(p.id))),
    [probeList, compatibleProbeIds, manuallyAllowedProbeIds],
  )

  const categorizeProbe = useCallback((probe) => {
    const t = normalizeName(probe?.type)
    if (t.includes('convex')) return 'convex'
    if (t.includes('linear')) return 'linear'
    return 'extra'
  }, [])

  const groupedVisibleProbes = useMemo(() => {
    const buckets = { convex: [], linear: [], extra: [] }
    visibleProbes.forEach((p) => {
      const key = categorizeProbe(p)
      buckets[key].push(p)
    })
    return buckets
  }, [visibleProbes, categorizeProbe])

  const incompatibleProbes = useMemo(
    () =>
      probeList.filter((p) => !compatibleProbeIds.has(String(p.id)) && !manuallyAllowedProbeIds.has(String(p.id))),
    [probeList, compatibleProbeIds, manuallyAllowedProbeIds],
  )

  const groupedIncompatibleProbes = useMemo(() => {
    const buckets = { convex: [], linear: [], extra: [] }
    incompatibleProbes.forEach((p) => {
      const key = categorizeProbe(p)
      buckets[key].push(p)
    })
    return buckets
  }, [incompatibleProbes, categorizeProbe])

  const openExtraProbeModal = () => {
    const next = {}
    incompatibleProbes.forEach((p) => {
      next[p.id] = manuallyAllowedProbeIds.has(String(p.id))
    })
    setExtraProbeSelection(next)
    setShowExtraProbeModal(true)
  }

  const applyExtraProbes = () => {
    const nextSet = new Set(manuallyAllowedProbeIds)
    Object.entries(extraProbeSelection).forEach(([id, checked]) => {
      const key = String(id)
      if (checked) nextSet.add(key)
      else nextSet.delete(key)
    })
    setManuallyAllowedProbeIds(nextSet)
    setShowExtraProbeModal(false)
  }

  const hasEquipment = selectedUltrasoundIds.length > 0

  const handleOptionalToggle = (id, checked) => {
    setOptionalSelection((prev) => ({
      ...prev,
      [id]: { checked, quantity: prev[id]?.quantity || 1 },
    }))
  }

  const handleOptionalQty = (item, qty) => {
    setOptionalSelection((prev) => {
      const max = item.maxQuantity
      const prevQty = prev[item.id]?.quantity || 0
      if (max != null && qty > max && prevQty <= max) {
        alert(`이 물품은 최대 ${max}개/주까지 사용할 수 있습니다.`)
      }
      const nextQty = max != null ? Math.min(qty, max ?? qty) : qty
      return {
        ...prev,
        [item.id]: { checked: prev[item.id]?.checked ?? true, quantity: Math.max(0, nextQty) },
      }
    })
  }

  const handleEmployeeToggle = (id, checked) => {
    setEmployeeSelection((prev) => ({ ...prev, [id]: checked }))
  }

  const addPartTimerRow = () => {
    const available = partTimers.find(
      (pt) => !assignedPartTimers.some((row) => String(row.partTimeWorkerId) === String(pt.id)),
    )
    setAssignedPartTimers((prev) => [...prev, { partTimeWorkerId: available?.id ?? null, workHours: 4 }])
  }

  const updatePartTimerRow = (index, field, value) => {
    setAssignedPartTimers((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const removePartTimerRow = (index) => {
    setAssignedPartTimers((prev) => prev.filter((_, i) => i !== index))
  }

  const totalUltrasoundCount = useMemo(
    () => Object.values(equipment).reduce((sum, qty) => sum + qty, 0),
    [equipment],
  )

  const basicItems = useMemo(() => {
    const n = totalUltrasoundCount
    return BASIC_ITEM_RULES.map((rule) => {
      const quantity = rule.fixedQuantity ?? rule.perUltrasound * n
      return { name: rule.name, quantity }
    }).filter((item) => item.quantity > 0)
  }, [totalUltrasoundCount])

  const optionalItems = useMemo(() => {
    const basicNames = new Set(BASIC_ITEM_RULES.map((i) => i.name))
    return eventItems.filter((item) => !basicNames.has(item.name))
  }, [eventItems])

  const groupedOptionalItems = useMemo(() => {
    const collator = new Intl.Collator('ko-KR')
    const order = ['X배너', '브로셔', '브로셔 홀더', '기타']
    const grouped = optionalItems.reduce((acc, item) => {
      const key = item.itemType || '기타'
      acc[key] = acc[key] ? [...acc[key], item] : [item]
      return acc
    }, {})
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const ai = order.indexOf(a)
      const bi = order.indexOf(b)
      const av = ai === -1 ? Number.MAX_SAFE_INTEGER : ai
      const bv = bi === -1 ? Number.MAX_SAFE_INTEGER : bi
      return av - bv || a.localeCompare(b)
    })
    const sorted = {}
    sortedKeys.forEach((key) => {
      sorted[key] = grouped[key].slice().sort((a, b) => collator.compare(a.name || '', b.name || ''))
    })
    return sorted
  }, [optionalItems])

  const groupedEmployees = useMemo(() => {
    const collator = new Intl.Collator('ko-KR')
    const positionOrder = ['인턴', '사원', '주임', '대리', '과장', '차장', '부장', '이사', '전무', '상무', '부사장', '사장']
    const positionRank = (value = '') => {
      const trimmed = value.trim()
      const idx = positionOrder.indexOf(trimmed)
      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx
    }
    const order = ['알피니언 본사']
    const grouped = employees.reduce((acc, emp) => {
      const key = emp.organizationName || emp.team || emp.type || emp.position || '기타'
      acc[key] = acc[key] ? [...acc[key], emp] : [emp]
      return acc
    }, {})
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const ai = order.indexOf(a)
      const bi = order.indexOf(b)
      const av = ai === -1 ? Number.MAX_SAFE_INTEGER : ai
      const bv = bi === -1 ? Number.MAX_SAFE_INTEGER : bi
      return av - bv || a.localeCompare(b)
    })
    const sorted = {}
    sortedKeys.forEach((key) => {
      sorted[key] = grouped[key]
        .slice()
        .sort(
          (a, b) =>
            positionRank(a.position || a.role) - positionRank(b.position || b.role) ||
            collator.compare(a.name || '', b.name || '')
        )
    })
    return sorted
  }, [employees])

  const addCustomItemRow = () => {
    setCustomItems((prev) => [...prev, { name: '', quantity: 0 }])
  }

  const updateCustomItem = (index, key, value) => {
    setCustomItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }

  const removeCustomItem = (index) => {
    setCustomItems((prev) => prev.filter((_, i) => i !== index))
  }

  const buildItemsPayload = () => {
    const itemsPayload = []
    const nameToId = new Map(eventItems.map((item) => [String(item.name), item.id]))

    // 기본 물품 (자동 계산)
    basicItems.forEach((item) => {
      const matchedId = nameToId.get(String(item.name))
      if (matchedId) {
        itemsPayload.push({ eventItemId: matchedId, quantity: item.quantity })
      }
    })

    // 사전 정의 선택 물품
    optionalItems
      .filter((item) => optionalSelection[item.id]?.checked)
      .forEach((item) => {
        const qty = optionalSelection[item.id]?.quantity || 1
        itemsPayload.push({
          eventItemId: item.id,
          quantity: qty,
        })
      })

    return itemsPayload
  }

  const buildTempItemsPayload = () =>
    customItems
      .filter((item) => item.name?.trim() && Number(item.quantity) > 0)
      .map((item) => ({
        tempItemName: item.name.trim(),
        quantity: Number(item.quantity),
      }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        event: {
          name: form.name,
          eventDate: form.date,
          eventTime: form.time,
          location: form.location || null,
          participantCount: Number(form.participantCount) || 0,
          remark: form.remark || null,
        },
        ultraSounds: Object.entries(equipment)
          .filter(([, qty]) => qty > 0)
          .map(([id, quantity]) => {
            const found = ultrasoundList.find((item) => String(item.id) === String(id))
            return {
              name: found?.name || String(id),
              quantity,
            }
          }),
        probes: Object.entries(probeSelection)
          .filter(([, qty]) => qty > 0)
          .map(([id, quantity]) => {
            const found = probeList.find((item) => String(item.id) === String(id))
            return {
              name: found?.name || String(id),
              quantity,
            }
          }),
        items: buildItemsPayload(),
        tempItems: buildTempItemsPayload(),
        employees: Object.entries(employeeSelection)
          .filter(([, checked]) => checked)
          .map(([id]) => ({
            employeeId: Number(id),
            role: null,
          })),
        partTimeWorkers: assignedPartTimers
          .filter((row) => row.partTimeWorkerId)
          .map((row) => ({
            partTimeWorkerId: Number(row.partTimeWorkerId),
            workHours: Number(row.workHours) || 0,
          })),
      }

      if (shipment.driverName || shipment.expectShipmentTime || shipment.expectArriveTime) {
        payload.shipment = {
          driverName: shipment.driverName || null,
          expectShipmentTime: shipment.expectShipmentTime || null,
          expectArriveTime: shipment.expectArriveTime || null,
          realShipmentTime: null,
          realArriveTime: null,
        }
      }

      const url = isEdit ? `/events/${eventId}` : '/events'
      const res = isEdit ? await api.put(url, payload) : await api.post(url, payload)
      const newId = isEdit ? eventId : res.data?.eventId || res.data?.id
      navigate(newId ? `/events/${newId}` : '/')
    } catch (err) {
      setError('요청에 실패했습니다.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>불러오는 중...</p>

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2>{isEdit ? '일정 수정' : '새 일정 생성'}</h2>
        <button type="submit" className={styles.primary} disabled={saving}>
          {saving ? '저장 중...' : isEdit ? '수정' : '저장'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.section}>
        <h3>행사 기본 정보</h3>
        <div className={styles.grid}>
          <label>
            행사 이름
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            날짜
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </label>
          <label>
            시간
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
          </label>
          <label>
            예상 인원
            <input
              type="number"
              value={form.participantCount}
              onChange={(e) => setForm({ ...form, participantCount: e.target.value })}
            />
          </label>
          <label className={styles.fullRow}>
            주소 (Location)
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </label>
          <label className={styles.fullRow}>
            비고
            <textarea
              rows={3}
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h3>투입 장비 (UltraSound)</h3>
        <div className={styles.list}>
          {ultrasoundList.map((item) => (
            <div key={item.id} className={styles.row}>
              <span>{item.name}</span>
              <div className={styles.counter}>
                <button type="button" onClick={() => handleEquipment(item.id, -1)}>
                  -
                </button>
                <span>{equipment[item.id] || 0}</span>
                <button type="button" onClick={() => handleEquipment(item.id, 1)}>
                  +
                </button>
              </div>
            </div>
          ))}
          {!ultrasoundList.length && <p>등록된 장비가 없습니다.</p>}
        </div>
      </section>

      <section className={styles.section}>
        <h3>프로브</h3>
        {!hasEquipment ? (
          <p className={styles.helperText}>투입 장비를 먼저 선택하면 호환 프로브가 표시됩니다.</p>
        ) : (
          <>
            <p className={styles.helperText}>
              선택된 장비와 호환되는 프로브만 표시됩니다. 필요 시 호환 외 프로브를 추가할 수 있습니다.
            </p>
            <div className={styles.probeGrid}>
              {[
                { key: 'convex', label: 'Convex' },
                { key: 'linear', label: 'Linear' },
                { key: 'extra', label: 'Extra' },
              ].map((group) => (
                <div key={group.key} className={styles.probeColumn}>
                  <div className={styles.probeColumnHeader}>
                    <h4>{group.label}</h4>
                  </div>
                  <div className={styles.list}>
                    {groupedVisibleProbes[group.key].map((item) => (
                      <div key={item.id} className={styles.row}>
                        <span>{item.name}</span>
                        <div className={styles.counter}>
                          <button type="button" onClick={() => handleProbe(item.id, -1)}>
                            -
                          </button>
                          <span>{probeSelection[item.id] || 0}</span>
                          <button type="button" onClick={() => handleProbe(item.id, 1)}>
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    {!groupedVisibleProbes[group.key].length && (
                      <p className={styles.helperText}>표시할 프로브가 없습니다.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!!incompatibleProbes.length && (
              <div className={styles.extraAction}>
                <button type="button" onClick={openExtraProbeModal}>
                  호환 외 프로브 추가
                </button>
              </div>
            )}
            <div className={styles.compatibility}>
              <h4>장비별 호환 프로브</h4>
              {selectedUltrasoundIds.map((uid) => {
                const us = ultrasoundList.find((u) => String(u.id) === String(uid))
                const compatibles = probeList.filter((p) => probeMatchesUltrasound(us, p))
                return (
                  <div key={uid} className={styles.compatRow}>
                    <strong>{us?.name || uid}</strong>
                    <span className={styles.compatList}>
                      {compatibles.length
                        ? compatibles.map((p) => p.name).join(', ')
                        : '호환 프로브 없음 (스펙 미설정)'}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>

      <section className={styles.section}>
        <h3>기본 물품</h3>
        {basicItems.length ? (
          <ul className={styles.simpleList}>
            {basicItems.map((item) => (
              <li key={item.name}>
                {item.name} = {item.quantity} 개
              </li>
            ))}
          </ul>
        ) : (
          <p>장비 수량에 따라 자동 계산됩니다.</p>
        )}
      </section>

      <section className={styles.section}>
        <h3>추가 물품</h3>
        <div className={styles.gridColumns}>
          {Object.keys(groupedOptionalItems).map((type) => (
            <div key={type}>
              <strong>{type}</strong>
              <div className={styles.columnList}>
                {groupedOptionalItems[type].map((item) => (
                  <label key={item.id} className={styles.row}>
                    <div className={styles.checkboxGroup}>
                      <input
                        type="checkbox"
                        checked={optionalSelection[item.id]?.checked || false}
                        onChange={(e) => handleOptionalToggle(item.id, e.target.checked)}
                      />
                      <span>{item.name}</span>
                      <input
                        type="number"
                        min="0"
                        value={optionalSelection[item.id]?.quantity || 0}
                        onChange={(e) => handleOptionalQty(item, Number(e.target.value))}
                        className={`${styles.numberInput} ${styles.inlineNumber}`}
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {!optionalItems.length && <p>선택 가능한 물품이 없습니다.</p>}
        </div>
      </section>

      <section className={styles.section}>
        <h3>자유 입력 물품</h3>
        <div className={styles.list}>
          {customItems.map((item, idx) => (
            <div key={idx} className={styles.row}>
              <input
                placeholder="물품명"
                value={item.name}
                onChange={(e) => updateCustomItem(idx, 'name', e.target.value)}
              />
              <input
                type="number"
                min="0"
                placeholder="수량"
                value={item.quantity}
                onChange={(e) => updateCustomItem(idx, 'quantity', Number(e.target.value))}
                className={styles.numberInput}
              />
              {customItems.length > 1 && (
                <button type="button" onClick={() => removeCustomItem(idx)}>
                  삭제
                </button>
              )}
            </div>
          ))}
          <div className={styles.extraAction}>
            <button type="button" onClick={addCustomItemRow}>
              + 물품 추가
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3>인력 배정</h3>
        <div className={styles.gridColumns}>
          {Object.keys(groupedEmployees).map((type) => (
            <div key={type}>
              <strong>{type}</strong>
              <div className={styles.columnList}>
                {groupedEmployees[type].map((emp) => {
                  const title = emp.position || emp.role || ''
                  return (
                    <label key={emp.id} className={styles.checkboxGroup}>
                      <input
                        type="checkbox"
                        checked={employeeSelection[emp.id] || false}
                        onChange={(e) => handleEmployeeToggle(emp.id, e.target.checked)}
                      />
                      <span>
                        {emp.name}
                        {title ? ` (${title})` : ''}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
          {!employees.length && <p>등록된 인력이 없습니다.</p>}
        </div>
      </section>

      <section className={styles.section}>
        <h3>아르바이트 배정</h3>
        <div className={styles.list}>
          <div className={styles.rowHeader}>
            <span>이름</span>
            <span>근무 시간</span>
          </div>
          {assignedPartTimers.map((row, idx) => {
            const selectedId = row.partTimeWorkerId
            const availableOptions = partTimers
              .filter(
                (pt) =>
                  String(pt.id) === String(selectedId) ||
                  !assignedPartTimers.some(
                    (other, otherIdx) =>
                      otherIdx !== idx && String(other.partTimeWorkerId) === String(pt.id),
                  ),
              )
              .map((pt) => ({ value: pt.id, label: pt.name }))

            return (
              <div key={idx} className={styles.row}>
                <select
                  value={selectedId ?? ''}
                  onChange={(e) => updatePartTimerRow(idx, 'partTimeWorkerId', e.target.value)}
                >
                  <option value="">아르바이트 선택</option>
                  {availableOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  value={row.workHours}
                  onChange={(e) => updatePartTimerRow(idx, 'workHours', Number(e.target.value))}
                  className={styles.numberInput}
                />
                <button type="button" onClick={() => removePartTimerRow(idx)}>
                  삭제
                </button>
              </div>
            )
          })}
          {!assignedPartTimers.length && <p>배정된 아르바이트가 없습니다.</p>}
          <div className={styles.extraAction}>
            <button type="button" onClick={addPartTimerRow}>
              + 인원 추가
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3>장비 출발/도착 예정</h3>
        <div className={styles.grid}>
          <label>
            기사 이름
            <input
              value={shipment.driverName}
              onChange={(e) => setShipment({ ...shipment, driverName: e.target.value })}
            />
          </label>
          <label>
            출발 예정 시간
            <input
              type="datetime-local"
              value={shipment.expectShipmentTime}
              onChange={(e) => setShipment({ ...shipment, expectShipmentTime: e.target.value })}
            />
          </label>
          <label>
            도착 예정 시간
            <input
              type="datetime-local"
              value={shipment.expectArriveTime}
              onChange={(e) => setShipment({ ...shipment, expectArriveTime: e.target.value })}
            />
          </label>
        </div>
      </section>

      {showExtraProbeModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h4>호환 외 프로브 추가</h4>
              <button type="button" onClick={() => setShowExtraProbeModal(false)}>
                닫기
              </button>
            </div>
            <p className={styles.helperText}>선택한 장비와 호환되지 않는 프로브 목록입니다.</p>
            <div className={styles.probeGrid}>
              {[
                { key: 'convex', label: 'Convex' },
                { key: 'linear', label: 'Linear' },
                { key: 'extra', label: 'Extra' },
              ].map((group) => (
                <div key={group.key} className={styles.probeColumn}>
                  <div className={styles.probeColumnHeader}>
                    <h4>{group.label}</h4>
                  </div>
                  <div className={styles.columnList}>
                    {groupedIncompatibleProbes[group.key].map((p) => (
                      <label key={p.id} className={styles.checkboxGroup}>
                        <input
                          type="checkbox"
                          checked={extraProbeSelection[p.id] || false}
                          onChange={(e) =>
                            setExtraProbeSelection((prev) => ({
                              ...prev,
                              [p.id]: e.target.checked,
                            }))
                          }
                        />
                        {p.name}
                      </label>
                    ))}
                    {!groupedIncompatibleProbes[group.key].length && (
                      <p className={styles.helperText}>표시할 프로브가 없습니다.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setShowExtraProbeModal(false)}>
                취소
              </button>
              <button type="button" className={styles.primary} onClick={applyExtraProbes}>
                선택 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

export default EventForm
