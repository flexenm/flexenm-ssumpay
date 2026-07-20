import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tag, MoreVertical, Info } from 'lucide-react'
import { inquiriesApi } from '../../../api'

const typeLabel = { 1: '충전', 2: '결제', 3: '취소·환불', 4: '기타' }

export default function InquiryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inquiry, setInquiry] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', content: '' })
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    inquiriesApi.get(id).then(r => setInquiry(r.data)).catch(() => navigate(-1))
  }, [id])

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openEdit = () => {
    setEditForm({ title: inquiry.title, content: inquiry.content })
    setEditing(true)
    setMenuOpen(false)
  }

  const saveEdit = async () => {
    await inquiriesApi.update(id, editForm)
    const r = await inquiriesApi.get(id)
    setInquiry(r.data)
    setEditing(false)
  }

  const del = async () => {
    await inquiriesApi.delete(id)
    navigate(-1)
  }

  if (!inquiry) return <div style={{ padding: 80, textAlign: 'center' }}>로딩중...</div>

  const isPending = inquiry.status === 0

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 32 }}>홈 &gt; 고객센터 &gt; 1:1문의</p>
      <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>고객센터</h1>

      {/* 상태 + 유형 + 메뉴 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            padding: '4px 14px', borderRadius: 16, fontSize: 13, fontWeight: 600,
            background: isPending ? '#f1f5f9' : '#2563eb',
            color: isPending ? '#94a3b8' : '#fff'
          }}>
            {isPending ? '답변 대기' : '답변 완료'}
          </span>
          <span style={{ color: '#64748b', fontSize: 13 }}>문의 유형: {typeLabel[inquiry.type] || '기타'}</span>
        </div>
        {isPending && (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6 }}>
              <MoreVertical size={20} color="#64748b" />
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: 36, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 100, zIndex: 10 }}>
                <button onClick={openEdit} style={{ display: 'block', width: '100%', padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14 }}>수정</button>
                <button onClick={() => { setDeleteConfirm(true); setMenuOpen(false) }} style={{ display: 'block', width: '100%', padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, color: '#ef4444' }}>삭제</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 제목 + 날짜 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tag size={16} color="#2563eb" strokeWidth={2} />
          {editing ? (
            <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
              style={{ fontSize: 20, fontWeight: 700, border: '1px solid #2563eb', borderRadius: 6, padding: '4px 10px', outline: 'none', width: 400 }} />
          ) : inquiry.title}
        </h2>
        <span style={{ color: '#94a3b8', fontSize: 13, flexShrink: 0, marginLeft: 16 }}>
          {new Date(inquiry.createdAt).toLocaleDateString('ko-KR').replace(/\.$/, '')}
        </span>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: 20 }} />

      {/* 문의 내용 */}
      {editing ? (
        <textarea value={editForm.content} onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
          rows={10} style={{ width: '100%', border: '1px solid #2563eb', borderRadius: 8, padding: 16, fontSize: 14, lineHeight: 1.8, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }} />
      ) : (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '24px', minHeight: 160, fontSize: 14, lineHeight: 1.8, color: '#374151', marginBottom: 40 }}>
          {inquiry.content}
        </div>
      )}

      {editing && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 40 }}>
          <button onClick={() => setEditing(false)} style={{ padding: '10px 24px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', background: '#fff' }}>취소</button>
          <button onClick={saveEdit} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>저장</button>
        </div>
      )}

      {/* 답변 */}
      {!editing && (
        isPending ? (
          <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <Info size={18} color="#2563eb" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 14, color: '#64748b' }}>아직 답변이 등록되지 않았습니다. 답변이 등록되면 이메일로 알려드립니다.</p>
          </div>
        ) : inquiry.answer ? (
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>답변</h3>
            <div style={{ borderLeft: '3px solid #2563eb', background: '#f8fafc', borderRadius: '0 8px 8px 0', padding: '20px 24px', fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
              {inquiry.answer}
            </div>
          </div>
        ) : null
      )}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '12px 40px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
          목록으로
        </button>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 360, textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>문의를 삭제하시겠습니까?</p>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>삭제된 문의는 복구할 수 없습니다.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteConfirm(false)} style={{ flex: 1, padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', background: '#fff' }}>취소</button>
              <button onClick={del} style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
