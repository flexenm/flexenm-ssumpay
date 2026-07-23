import { useState, useEffect } from 'react'
import { adminDashboardApi } from '../../../api'
import type { DashboardSummary } from '../../../types'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)

  useEffect(() => {
    adminDashboardApi.get().then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <div>로딩중...</div>

  const stats = [
    { label: '전체 회원', value: `${data.totalMembers}건` },
    { label: '오늘 주문 건수', value: `${(data.todayOrderCount ?? 0).toLocaleString()}건` },
    { label: '충전 대기', value: `${data.pendingCharges}건` },
    { label: '미답변 문의', value: `${data.pendingInquiries}건` },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>
      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-slate-400 text-sm mb-2">{s.label}</p>
            <p className="text-[28px] font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-bold mb-4">최근 7일 매출</h2>
        {data.salesByDay.length === 0
          ? <p className="text-slate-400 text-center p-10">데이터가 없습니다.</p>
          : (
            <table className="w-full border-collapse">
              <thead><tr className="bg-slate-50">
                {['날짜', '매출'].map(h => <th key={h} className="px-4 py-2.5 text-left text-sm">{h}</th>)}
              </tr></thead>
              <tbody>
                {data.salesByDay.map(d => (
                  <tr key={d.date} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-sm">{d.date}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{Number(d.total).toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  )
}
