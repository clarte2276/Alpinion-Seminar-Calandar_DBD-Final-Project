import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import styles from './Admin.module.css'

const resourceConfigs = {
  organizations: {
    label: '조직',
    idField: 'name',
    fields: [
      { key: 'name', label: '이름', required: true },
      { key: 'location', label: '주소' },
      { key: 'contact', label: '연락처' },
      { key: 'representative', label: '대표' },
      { key: 'type', label: '유형' },
    ],
    fromApi: (row) => ({
      name: row.Name || row.name || '',
      location: row.Location || row.location || '',
      contact: row.Contact || row.contact || '',
      representative: row.Representative || row.representative || '',
      type: row.Type || row.type || '',
    }),
    toPayload: (form) => ({
      name: form.name,
      location: form.location || null,
      contact: form.contact || null,
      representative: form.representative || null,
      type: form.type || null,
    }),
  },
  employees: {
    label: '직원',
    idField: 'id',
    fields: [
      { key: 'id', label: 'ID', readOnly: true, hideOnCreate: true },
      { key: 'name', label: '이름', required: true },
      { key: 'position', label: '직책' },
      { key: 'team', label: '팀' },
      { key: 'organizationName', label: '소속(조직명)' },
      { key: 'contact', label: '연락처' },
    ],
    fromApi: (row) => ({
      id: row.EmployeeID ?? row.employeeId ?? row.id ?? '',
      name: row.Name || row.name || '',
      position: row.Position || row.position || '',
      team: row.Team || row.team || '',
      organizationName: row.OrganizationName || row.organizationName || '',
      contact: row.Contact || row.contact || '',
    }),
    toPayload: (form) => ({
      name: form.name,
      position: form.position || null,
      team: form.team || null,
      organizationName: form.organizationName || null,
      contact: form.contact || null,
    }),
  },
  'part-time-workers': {
    label: '아르바이트',
    idField: 'id',
    fields: [
      { key: 'id', label: 'ID', readOnly: true, hideOnCreate: true },
      { key: 'name', label: '이름', required: true },
      { key: 'age', label: '나이', type: 'number' },
      { key: 'gender', label: '성별' },
      { key: 'accountNumber', label: '계좌번호' },
    ],
    fromApi: (row) => ({
      id: row.PartTimeWorkerID ?? row.partTimeWorkerId ?? row.id ?? '',
      name: row.Name || row.name || '',
      age: row.Age ?? row.age ?? '',
      gender: row.Gender || row.gender || '',
      accountNumber: row.AccountNumber || row.accountNumber || '',
    }),
    toPayload: (form) => ({
      name: form.name,
      age: form.age === '' ? null : Number(form.age),
      gender: form.gender || null,
      accountNumber: form.accountNumber || null,
    }),
  },
  ultrasounds: {
    label: '초음파 장비',
    idField: 'name',
    fields: [{ key: 'name', label: '장비명', required: true }],
    fromApi: (row) => ({
      name: row.Name || row.name || '',
    }),
    toPayload: (form) => ({
      name: form.name,
    }),
  },
  probes: {
    label: '프로브',
    idField: 'name',
    fields: [
      { key: 'name', label: '프로브명', required: true },
      { key: 'type', label: '타입' },
      { key: 'application', label: 'Application' },
    ],
    fromApi: (row) => ({
      name: row.Name || row.name || '',
      type: row.Type || row.type || '',
      application: row.Application || row.application || '',
    }),
    toPayload: (form) => ({
      name: form.name,
      type: form.type || null,
      application: form.application || null,
    }),
  },
  'event-items': {
    label: '물품',
    idField: 'id',
    fields: [
      { key: 'id', label: 'ID', readOnly: true, hideOnCreate: true },
      { key: 'itemType', label: '유형', required: true },
      { key: 'itemName', label: '이름', required: true },
      { key: 'maxQuantity', label: '최대 개수', type: 'number' },
    ],
    fromApi: (row) => ({
      id: row.EventItemID ?? row.eventItemId ?? row.id ?? '',
      itemType: row.ItemType || row.itemType || '',
      itemName: row.ItemName || row.itemName || row.name || '',
      maxQuantity: row.MaxQuantity ?? row.maxQuantity ?? '',
    }),
    toPayload: (form) => ({
      itemType: form.itemType,
      itemName: form.itemName,
      maxQuantity: form.maxQuantity === '' ? null : Number(form.maxQuantity),
    }),
  },
}

const getConfig = (resource) => resourceConfigs[resource] || { label: resource, idField: 'id', fields: [] }
const buildEmptyForm = (config) =>
  config.fields.reduce((acc, field) => {
    acc[field.key] = field.defaultValue ?? ''
    return acc
  }, {})

const normalizeRow = (config, row) => (config.fromApi ? config.fromApi(row) : row)
const toPayload = (config, form) => (config.toPayload ? config.toPayload(form) : form)
const toIdValue = (config, item) => item?.[config.idField] ?? item?.id

const coerceFieldValue = (field, raw) => {
  if (field.type === 'number') {
    return raw === '' ? '' : Number(raw)
  }
  return raw
}

function AdminResource() {
  const { resource } = useParams()
  const config = getConfig(resource)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newItem, setNewItem] = useState(buildEmptyForm(config))
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [probeList, setProbeList] = useState([])
  const [compatibility, setCompatibility] = useState({})
  const [compatEdit, setCompatEdit] = useState([])
  const [compatTarget, setCompatTarget] = useState('')
  const [showCompatModal, setShowCompatModal] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/admin/${resource}`)
      const normalized = (res.data || []).map((row) => normalizeRow(config, row))
      setData(normalized)
      if (resource === 'ultrasounds') {
        const [compatRes, probeRes] = await Promise.all([
          api.get('/admin/ultrasound-probe-compatibility'),
          api.get('/admin/probes'),
        ])
        const map = (compatRes.data || []).reduce((acc, row) => {
          const us = row.UltraSoundName || row.ultraSoundName || row.ultrasoundName || ''
          const pb = row.ProbeName || row.probeName || ''
          if (!us || !pb) return acc
          acc[us] = acc[us] ? [...acc[us], pb] : [pb]
          return acc
        }, {})
        setCompatibility(map)
        setProbeList(probeRes.data || [])
      } else {
        setCompatibility({})
        setProbeList([])
      }
    } catch (err) {
      setError('목록을 불러오지 못했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    setNewItem(buildEmptyForm(config))
    setEditingId(null)
    setEditForm({})
    setCompatEdit([])
    setCompatTarget('')
    setShowCompatModal(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource])

  const columns = useMemo(() => {
    const base =
      config.fields.length || !data.length
        ? config.fields
        : Object.keys(data[0]).map((key) => ({ key, label: key }))
    if (resource === 'ultrasounds') {
      return [...base, { key: '__compat', label: '호환 프로브', compat: true }]
    }
    return base
  }, [config.fields, data, resource])

  const openCompatModal = (name) => {
    setCompatTarget(name)
    setCompatEdit(compatibility[name] || [])
    setShowCompatModal(true)
  }

  const applyCompat = async () => {
    if (!compatTarget) return
    try {
      await api.put(`/admin/ultrasounds/${compatTarget}/compatibility`, { probeNames: compatEdit })
      setShowCompatModal(false)
      setCompatTarget('')
      setCompatEdit([])
      fetchData()
    } catch (err) {
      alert('호환 프로브 저장에 실패했습니다.')
      console.error(err)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const payload = toPayload(config, newItem)
      await api.post(`/admin/${resource}`, payload)
      setNewItem(buildEmptyForm(config))
      fetchData()
    } catch (err) {
      alert('입력값을 확인해주세요 (생성 실패)')
      console.error(err)
    }
  }

  const handleSaveEdit = async () => {
    const id = editingId
    if (!id) return
    try {
      const payload = toPayload(config, editForm)
      await api.put(`/admin/${resource}/${id}`, payload)
      setEditingId(null)
      setEditForm({})
      fetchData()
    } catch (err) {
      alert('입력값을 확인해주세요 (수정 실패)')
      console.error(err)
    }
  }

  const handleDelete = async (item) => {
    const id = toIdValue(config, item)
    if (!id) {
      alert('id 값이 없습니다.')
      return
    }
    if (!confirm('삭제 하시겠습니까?')) return
    try {
      await api.delete(`/admin/${resource}/${id}`)
      fetchData()
    } catch (err) {
      alert('삭제 실패')
      console.error(err)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>관리 {config.label}</h2>
      </div>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.card}>
        <h4>새로 추가</h4>
        <form onSubmit={handleCreate} className={styles.formGrid}>
          {config.fields
            .filter((field) => !field.hideOnCreate)
            .map((field) => (
              <label key={field.key} className={styles.formField}>
                <span>{field.label}</span>
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  step={field.type === 'number' ? 'any' : undefined}
                  value={newItem[field.key] ?? ''}
                  required={field.required}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      [field.key]: coerceFieldValue(field, e.target.value),
                    }))
                  }
                />
              </label>
            ))}
          <div className={styles.actions}>
            <button type="submit" className={styles.primary}>
              추가
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <div className={styles.tableWrapper}>
          {data.length === 0 ? (
            <p>데이터가 없습니다.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const rowId = toIdValue(config, row) || JSON.stringify(row)
                  const isEditing = editingId === rowId
                  return (
                    <tr key={rowId}>
                      {columns.map((col) => {
                        const fieldDef = config.fields.find((f) => f.key === col.key) || {}
                        if (col.compat) {
                          const selected = compatibility[row.name] || compatibility[row.Name] || []
                          return (
                            <td key={col.key}>
                              <div className={styles.compatList}>
                                {selected.length
                                  ? selected.map((name) => (
                                      <span key={name} className={styles.chip}>
                                        {name}
                                      </span>
                                    ))
                                  : '없음'}
                              </div>
                            </td>
                          )
                        }
                        if (isEditing && !fieldDef.readOnly && !fieldDef.readOnlyOnEdit) {
                          return (
                            <td key={col.key}>
                              <input
                                type={fieldDef.type === 'number' ? 'number' : 'text'}
                                step={fieldDef.type === 'number' ? 'any' : undefined}
                                value={editForm[col.key] ?? ''}
                                disabled={fieldDef.readOnly || fieldDef.readOnlyOnEdit}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    [col.key]: coerceFieldValue(fieldDef, e.target.value),
                                  }))
                                }
                              />
                            </td>
                          )
                        }
                        return <td key={col.key}>{String(row[col.key] ?? '')}</td>
                      })}
                      <td className={styles.actions}>
                        {resource === 'ultrasounds' && (
                          <button
                            onClick={() => openCompatModal(row.name || row.Name)}
                            className={styles.secondary}
                            type="button"
                          >
                            호환 수정
                          </button>
                        )}
                        {isEditing ? (
                          <>
                            <button onClick={handleSaveEdit} className={styles.primary}>
                              저장
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setEditForm({})
                              }}
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(rowId)
                                setEditForm(row)
                              }}
                            >
                              수정
                            </button>
                            <button className={styles.danger} onClick={() => handleDelete(row)}>
                              삭제
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showCompatModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h4>호환 프로브 수정 · {compatTarget}</h4>
              <button onClick={() => setShowCompatModal(false)}>닫기</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalList}>
                {probeList.map((pb) => {
                  const name = pb.Name || pb.name
                  const checked = compatEdit.includes(name)
                  return (
                    <label key={name} className={styles.checkboxInline}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setCompatEdit((prev) => {
                            const set = new Set(prev)
                            if (e.target.checked) set.add(name)
                            else set.delete(name)
                            return Array.from(set)
                          })
                        }}
                      />
                      <span>{name}</span>
                    </label>
                  )
                })}
                {!probeList.length && <p className={styles.helperText}>프로브가 없습니다.</p>}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowCompatModal(false)}>취소</button>
              <button className={styles.primary} onClick={applyCompat}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminResource
