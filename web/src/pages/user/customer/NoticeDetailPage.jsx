import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { noticesApi } from '../../../api'

export default function NoticeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    noticesApi.get(id).then(r => setNotice(r.data)).catch(() => navigate('/customer'))
  }, [id])

  if (!notice) return <div style={{ padding: 80, textAlign: 'center' }}>로딩중...</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>홈 &gt; 고객센터 &gt; 공지사항</p>
      <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>고객센터</h1>
      <div style={{ borderTop: '2px solid #1e293b', paddingTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#2563eb' }}>📌</span>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{notice.title}</h2>
          </div>
          <span style={{ color: '#94a3b8', fontSize: 14 }}>{new Date(notice.createdAt).toLocaleDateString()}</span>
        </div>
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, minHeight: 200, lineHeight: 1.8, color: '#374151' }}>
          {notice.content}
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <button onClick={() => navigate('/customer')} style={{ padding: '12px 40px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 }}>목록으로</button>
      </div>
    </div>
  )
}
