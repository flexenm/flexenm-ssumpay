import { useState, useEffect } from 'react'
import { adminDashboardApi } from '../../../api'

export default function DashboardPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    adminDashboardApi.get().then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <div>로딩중...</div>

  const stats = [
    { label: '전체 회원', value: `${data.totalMembers}건` },
    { label: '오늘 주문 금액', value: `${(data.todayOrders * 0).toLocaleString() || '0'}원` },
    { label: '충전 대기', value: `${data.pendingCharges}건` },
    { label: '미답변 문의', value: `${data.pendingInquiries}건` },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>대시보드</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>최근 7일 매출</h2>
        {data.salesByDay.length === 0
          ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>데이터가 없습니다.</p>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f8fafc' }}>
                {['날짜', '매출'].map(h => <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 14 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {data.salesByDay.map(d => (
                  <tr key={d.date} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{d.date}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{Number(d.total).toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  )
}
