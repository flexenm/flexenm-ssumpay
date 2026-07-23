import { useState, useEffect } from 'react'
import { adminOrdersApi } from '../../../api'
import type { AdminOrderListParams } from '../../../api'
import type { Order } from '../../../types'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [chargeStatus, setChargeStatus] = useState('')

  const load = (kw = keyword, ps = paymentStatus, cs = chargeStatus) => {
    const params: { keyword?: string; paymentStatus?: string; chargeStatus?: string } = {}
    if (kw) params.keyword = kw
    if (ps !== '') params.paymentStatus = ps
    if (cs !== '') params.chargeStatus = cs
    setLoading(true)
    adminOrdersApi.list(params as unknown as AdminOrderListParams).then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load('', '', '') }, [])

  const updateCharge = async (id: number, status: number) => {
    await adminOrdersApi.updateChargeStatus(id, { chargeStatus: status })
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">주문/충전 관리</h1>
      <div className="bg-white rounded-xl p-5 border border-gray-200 mb-5 flex gap-3 items-center flex-wrap">
        <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="주문번호/아이디 검색" className={inputClass} />
        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className={inputClass}>
          <option value="">결제상태 전체</option>
          <option value="0">미결제</option>
          <option value="1">결제완료</option>
        </select>
        <select value={chargeStatus} onChange={e => setChargeStatus(e.target.value)} className={inputClass}>
          <option value="">충전상태 전체</option>
          <option value="0">충전대기</option>
          <option value="1">충전완료</option>
        </select>
        <button onClick={() => load(keyword, paymentStatus, chargeStatus)} className={btnClass}>조회</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse">
          <thead><tr className="bg-slate-50">
            {['주문번호', '회원아이디', 'FlexTV 아이디', '상품', '금액', '결제상태', '충전상태', '관리'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[13px] font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} className="p-10 text-center text-slate-400">불러오는 중...</td></tr>
              : orders.length === 0
              ? <tr><td colSpan={8} className="p-10 text-center text-slate-400">데이터가 없습니다.</td></tr>
              : orders.map(o => (
                <tr key={o.id} className="border-b border-slate-100">
                  <td className={tdClass}>{o.orderNo}</td>
                  <td className={tdClass}>{o.member?.username || '-'}</td>
                  <td className={tdClass}>{o.flexUsername}</td>
                  <td className={tdClass}>{o.productName}</td>
                  <td className={tdClass}>{o.price?.toLocaleString()}원</td>
                  <td className={tdClass}><Badge v={o.paymentStatus} t={{ 0: '미결제', 1: '결제완료' }} /></td>
                  <td className={tdClass}><Badge v={o.chargeStatus} t={{ 0: '충전대기', 1: '충전완료' }} /></td>
                  <td className={tdClass}>
                    {o.chargeStatus === 0 && (
                      <button onClick={() => updateCharge(o.id, 1)} className="px-3 py-1 bg-blue-600 text-white border-none rounded-md cursor-pointer text-xs whitespace-nowrap">충전완료</button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Badge({ v, t }: { v: number; t: Record<number, string> }) {
  const bg: Record<number, string> = { 0: 'bg-slate-100', 1: 'bg-green-100' }
  const text: Record<number, string> = { 0: 'text-slate-400', 1: 'text-[#16a34a]' }
  return <span className={`inline-block px-2.5 py-1 rounded-xl text-xs whitespace-nowrap ${bg[v]} ${text[v]}`}>{t[v]}</span>
}

const inputClass = 'px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none'
const btnClass = 'px-5 py-2 bg-slate-800 text-white border-none rounded-lg cursor-pointer text-sm'
const tdClass = 'px-4 py-3 text-[13px] whitespace-nowrap'
