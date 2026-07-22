import { useState, useEffect } from 'react'
import { adminOrdersApi } from '../../../api'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [chargeStatus, setChargeStatus] = useState('')

  const load = (kw = keyword, ps = paymentStatus, cs = chargeStatus) => {
    const params = {}
    if (kw) params.keyword = kw
    if (ps !== '') params.paymentStatus = ps
    if (cs !== '') params.chargeStatus = cs
    setLoading(true)
    adminOrdersApi.list(params).then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load('', '', '') }, [])

  const updateCharge = async (id, status) => {
    await adminOrdersApi.updateChargeStatus(id, { chargeStatus: status })
    load()
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>주문/충전 관리</h1>
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="주문번호/아이디 검색" style={inputStyle} />
        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} style={inputStyle}>
          <option value="">결제상태 전체</option>
          <option value="0">미결제</option>
          <option value="1">결제완료</option>
        </select>
        <select value={chargeStatus} onChange={e => setChargeStatus(e.target.value)} style={inputStyle}>
          <option value="">충전상태 전체</option>
          <option value="0">충전대기</option>
          <option value="1">충전완료</option>
        </select>
        <button onClick={() => load(keyword, paymentStatus, chargeStatus)} style={btnStyle}>조회</button>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc' }}>
            {['주문번호', '회원아이디', 'FlexTV 아이디', '상품', '금액', '결제상태', '충전상태', '관리'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>불러오는 중...</td></tr>
              : orders.length === 0
              ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>데이터가 없습니다.</td></tr>
              : orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{o.orderNo}</td>
                  <td style={tdStyle}>{o.member?.username || '-'}</td>
                  <td style={tdStyle}>{o.flexUsername}</td>
                  <td style={tdStyle}>{o.productName}</td>
                  <td style={tdStyle}>{o.price?.toLocaleString()}원</td>
                  <td style={tdStyle}><Badge v={o.paymentStatus} t={{ 0: '미결제', 1: '결제완료' }} /></td>
                  <td style={tdStyle}><Badge v={o.chargeStatus} t={{ 0: '충전대기', 1: '충전완료' }} /></td>
                  <td style={tdStyle}>
                    {o.chargeStatus === 0 && (
                      <button onClick={() => updateCharge(o.id, 1)} style={{ padding: '4px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>충전완료</button>
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

function Badge({ v, t }) {
  const colors = { 0: '#f1f5f9', 1: '#dcfce7' }
  const textColors = { 0: '#94a3b8', 1: '#16a34a' }
  return <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 12, background: colors[v], color: textColors[v], fontSize: 12, whiteSpace: 'nowrap' }}>{t[v]}</span>
}

const inputStyle = { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }
const btnStyle = { padding: '8px 20px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }
const tdStyle = { padding: '12px 16px', fontSize: 13, whiteSpace: 'nowrap' }
