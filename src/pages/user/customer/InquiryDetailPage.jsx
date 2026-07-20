import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tag } from 'lucide-react'
import { inquiriesApi } from '../../../api'

const typeLabel = { 1: '충전', 2: '결제', 3: '취소·환불', 4: '기타' }

export default function InquiryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inquiry, setInquiry] = useState(null)

  useEffect(() => {
    inquiriesApi.get(id).then(r => setInquiry(r.data)).catch(() => navigate(-1))
  }, [id])

  if (!inquiry) return <div style={{ padding: 80, textAlign: 'center' }}>로딩중...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 32 }}>홈 &gt; 마이페이지 &gt; 1:1문의내역</p>

      {/* 상태 + 유형 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{
          padding: '4px 14px', borderRadius: 16, fontSize: 13, fontWeight: 600,
          background: inquiry.status === 1 ? '#2563eb' : '#f1f5f9',
          color: inquiry.status === 1 ? '#fff' : '#94a3b8'
        }}>
          {inquiry.status === 1 ? '답변 완료' : '답변 대기'}
        </span>
        <span style={{ color: '#64748b', fontSize: 13 }}>문의 유형: {typeLabel[inquiry.type] || '기타'}</span>
      </div>

      {/* 제목 + 날짜 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tag size={18} color="#2563eb" strokeWidth={2} />
          {inquiry.title}
        </h2>
        <span style={{ color: '#94a3b8', fontSize: 13, flexShrink: 0, marginLeft: 16 }}>
          {new Date(inquiry.createdAt).toLocaleDateString('ko-KR').replace(/\.$/, '')}
        </span>
      </div>

      {/* 문의 내용 */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '24px', minHeight: 160, fontSize: 14, lineHeight: 1.8, color: '#374151', marginBottom: 40 }}>
        {inquiry.content}
      </div>

      {/* 답변 */}
      {inquiry.status === 1 && inquiry.answer && (
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>답변</h3>
          <div style={{ borderLeft: '3px solid #2563eb', background: '#f8fafc', borderRadius: '0 8px 8px 0', padding: '20px 24px', fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
            {inquiry.answer}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '12px 40px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
          목록으로
        </button>
      </div>
    </div>
  )
}
