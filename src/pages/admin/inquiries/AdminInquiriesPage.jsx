import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminInquiriesApi } from '../../../api'

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([])
  const [status, setStatus] = useState('')

  const load = () => adminInquiriesApi.list({ status }).then(r => setInquiries(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>1:1 문의 관리</h1>
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', marginBottom: 20, display: 'flex', gap: 12 }}>
        <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
          <option value="">전체</option>
          <option value="0">답변 대기</option>
          <option value="1">답변 완료</option>
        </select>
        <button onClick={load} style={btnStyle}>조회</button>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc' }}>
            {['상태', '유형', '제목', '회원', '등록일', '답변일'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {inquiries.length === 0
              ? <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>데이터가 없습니다.</td></tr>
              : inquiries.map(q => (
                <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}><span style={{ padding: '3px 10px', borderRadius: 10, background: q.status === 1 ? '#dcfce7' : '#fef9c3', color: q.status === 1 ? '#16a34a' : '#ca8a04', fontSize: 12 }}>{q.status === 1 ? '답변완료' : '답변대기'}</span></td>
                  <td style={tdStyle}>{q.type}</td>
                  <td style={{ ...tdStyle }}>
                    <Link to={`/admin/inquiries/${q.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{q.title}</Link>
                  </td>
                  <td style={tdStyle}>{q.member?.username || '-'}</td>
                  <td style={tdStyle}>{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>{q.answeredAt ? new Date(q.answeredAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const inputStyle = { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }
const btnStyle = { padding: '8px 20px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }
const tdStyle = { padding: '12px 16px', fontSize: 13 }
