import { Link } from 'react-router-dom'
import styles from './Admin.module.css'

// 관리자 메인 - 각 테이블로 이동
const resources = [
  { key: 'organizations', label: '조직' },
  { key: 'employees', label: '직원' },
  { key: 'part-time-workers', label: '아르바이트' },
  { key: 'ultrasounds', label: '초음파 장비' },
  { key: 'probes', label: '프로브' },
  { key: 'event-items', label: '물품' },
]

function AdminHome() {
  return (
    <div className={styles.container}>
      <h2>관리자 페이지</h2>
      <div className={styles.grid}>
        {resources.map((res) => (
          <Link key={res.key} to={`/admin/${res.key}`} className={styles.card}>
            <span>{res.label}</span>
            <small>{res.key}</small>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AdminHome
