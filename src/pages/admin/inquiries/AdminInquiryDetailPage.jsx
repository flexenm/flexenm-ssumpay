import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminInquiriesApi } from '../../../api'

export default function AdminInquiryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inquiry, setInquiry] = useState(null)
  const [answer, setAnswer] = useState('')

  useEffect(() => {
    adminInquiriesApi.get(id).then(r => { setInquiry(r.data); setAnswer(r.data.answer || '') }).catch(() => navigate('/admin/inquiries'))
  }, [id])

  const submit = async () => {
    if (!answer) return alert('답변을 입력해주세요.')
    await adminInquiriesApi.answer(id, { answer })
    alert('답변이 등록되었습니다.')
    navigate('/admin/inquiries')
  }

  if (!inquiry) return <div>로딩중...</div>

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>1:1 문의 답변</h1>
        <button onClick={() => navigate('/admin/inquiries')} style={{ padding: '8px 20px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', background: '#fff' }}>목록으로</button>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
          {[['상태', inquiry.status === 1 ? '답변완료' : '답변대기'], ['유형', inquiry.type], ['작성자', inquiry.member?.username], ['등록일', new Date(inquiry.createdAt).toLocaleString()]].map(([k, v]) => (
            <div key={k}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>{k}: </span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{inquiry.title}</h2>
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, lineHeight: 1.8, minHeight: 100 }}>{inquiry.content}</div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>관리자 답변</h3>
        <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={8}
          placeholder="답변 내용을 입력하세요." disabled={inquiry.status === 1}
          style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        {inquiry.status === 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
            <button onClick={() => navigate('/admin/inquiries')} style={{ padding: '10px 24px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}>취소</button>
            <button onClick={submit} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>답변 등록</button>
          </div>
        )}
      </div>
    </div>
  )
}
