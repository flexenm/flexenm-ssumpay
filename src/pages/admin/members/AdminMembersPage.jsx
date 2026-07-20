import { useState, useEffect } from 'react'
import { adminMembersApi } from '../../../api'

export default function AdminMembersPage() {
  const [members, setMembers] = useState([])
  const [keyword, setKeyword] = useState('')

  const load = (kw = keyword) => {
    adminMembersApi.list({ keyword: kw }).then(r => setMembers(r.data)).catch(() => {})
  }
  useEffect(() => { load('') }, [])

  const toggleStatus = async (m) => {
    await adminMembersApi.updateStatus(m.id, { status: m.status === 0 ? 1 : 0 })
    load()
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>회원 관리</h1>
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', marginBottom: 20, display: 'flex', gap: 12 }}>
        <input value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(keyword)} placeholder="아이디/이메일 검색" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={() => load(keyword)} style={btnStyle}>조회</button>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc' }}>
            {['아이디', '이름', '이메일', '전화번호', 'FlexTV', '가입일', '상태', '관리'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {members.length === 0
              ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>데이터가 없습니다.</td></tr>
              : members.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{m.username}</td>
                  <td style={tdStyle}>{m.name}</td>
                  <td style={tdStyle}>{m.email}</td>
                  <td style={tdStyle}>{m.phone || '-'}</td>
                  <td style={tdStyle}>{m.flexUsername || '-'}</td>
                  <td style={tdStyle}>{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}><span style={{ padding: '3px 10px', borderRadius: 10, background: m.status === 0 ? '#dcfce7' : '#fee2e2', color: m.status === 0 ? '#16a34a' : '#dc2626', fontSize: 12 }}>{m.status === 0 ? '정상' : '차단'}</span></td>
                  <td style={tdStyle}>
                    <button onClick={() => toggleStatus(m)} style={{ padding: '4px 12px', background: m.status === 0 ? '#fee2e2' : '#dcfce7', color: m.status === 0 ? '#dc2626' : '#16a34a', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                      {m.status === 0 ? '차단' : '차단해제'}
                    </button>
                  </td>
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
