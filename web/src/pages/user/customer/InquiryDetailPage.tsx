import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tag, MoreVertical, Info } from 'lucide-react'
import { inquiriesApi } from '../../../api'
import type { Inquiry } from '../../../types'

const typeLabel: Record<number, string> = { 1: '충전', 2: '결제', 3: '취소·환불', 4: '기타' }

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', content: '' })
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inquiriesApi.get(id!).then(r => setInquiry(r.data)).catch(() => navigate(-1))
  }, [id])

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openEdit = () => {
    setEditForm({ title: inquiry!.title, content: inquiry!.content })
    setEditing(true)
    setMenuOpen(false)
  }

  const saveEdit = async () => {
    try {
      await inquiriesApi.update(id!, editForm)
      const r = await inquiriesApi.get(id!)
      setInquiry(r.data)
      setEditing(false)
    } catch (e) {
      alert((e as { message?: string })?.message || '수정 중 오류가 발생했습니다.')
    }
  }

  const del = async () => {
    try {
      await inquiriesApi.delete(id!)
      navigate(-1)
    } catch (e) {
      alert((e as { message?: string })?.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  if (!inquiry) return <div className="p-20 text-center">로딩중...</div>

  const isPending = inquiry.status === 0

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <p className="mb-8 text-[13px] text-slate-400">홈 &gt; 고객센터 &gt; 1:1문의</p>
      <h1 className="mb-10 text-center text-[32px] font-bold">고객센터</h1>

      {/* 상태 + 유형 + 메뉴 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`rounded-2xl px-3.5 py-1 text-[13px] font-semibold ${isPending ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white'}`}>
            {isPending ? '답변 대기' : '답변 완료'}
          </span>
          <span className="text-[13px] text-slate-500">문의 유형: {typeLabel[inquiry.type] || '기타'}</span>
        </div>
        {isPending && (
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(v => !v)} className="cursor-pointer rounded-md border-none bg-transparent p-1.5">
              <MoreVertical size={20} color="#64748b" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-10 min-w-[100px] rounded-lg border border-gray-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                <button onClick={openEdit} className="block w-full cursor-pointer border-none bg-transparent px-5 py-2.5 text-left text-sm">수정</button>
                <button onClick={() => { setDeleteConfirm(true); setMenuOpen(false) }} className="block w-full cursor-pointer border-none bg-transparent px-5 py-2.5 text-left text-sm text-red-500">삭제</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 제목 + 날짜 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-xl font-bold">
          <Tag size={16} color="#2563eb" strokeWidth={2} />
          {editing ? (
            <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
              className="w-[400px] rounded-md border border-blue-600 px-2.5 py-1 text-xl font-bold outline-none" />
          ) : inquiry.title}
        </h2>
        <span className="ml-4 shrink-0 text-[13px] text-slate-400">
          {new Date(inquiry.createdAt).toLocaleDateString('ko-KR').replace(/\.$/, '')}
        </span>
      </div>

      <hr className="mb-5 border-0 border-t border-gray-200" />

      {/* 문의 내용 */}
      {editing ? (
        <textarea value={editForm.content} onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
          rows={10} className="mb-4 box-border w-full resize-y rounded-lg border border-blue-600 p-4 text-sm leading-[1.8] outline-none" />
      ) : (
        <div className="mb-10 min-h-[160px] rounded-lg border border-gray-200 p-6 text-sm leading-[1.8] text-gray-700">
          {inquiry.content}
        </div>
      )}

      {editing && (
        <div className="mb-10 flex justify-end gap-3">
          <button onClick={() => setEditing(false)} className="cursor-pointer rounded-lg border border-gray-200 bg-white px-6 py-2.5">취소</button>
          <button onClick={saveEdit} className="cursor-pointer rounded-lg border-none bg-blue-600 px-6 py-2.5 font-semibold text-white">저장</button>
        </div>
      )}

      {/* 답변 */}
      {!editing && (
        isPending ? (
          <div className="mb-10 flex items-center gap-3 rounded-lg border border-gray-200 bg-slate-50 px-6 py-5">
            <Info size={18} color="#2563eb" className="shrink-0" />
            <p className="text-sm text-slate-500">아직 답변이 등록되지 않았습니다. 답변이 등록되면 이메일로 알려드립니다.</p>
          </div>
        ) : inquiry.answer ? (
          <div className="mb-10">
            <h3 className="mb-4 text-base font-bold">답변</h3>
            <div className="rounded-r-lg border-l-[3px] border-blue-600 bg-slate-50 px-6 py-5 text-sm leading-[1.8] text-gray-700">
              {inquiry.answer}
            </div>
          </div>
        ) : null
      )}

      <div className="flex justify-center">
        <button onClick={() => navigate(-1)} className="cursor-pointer rounded-lg border-none bg-slate-800 px-10 py-3 text-[15px] font-semibold text-white">
          목록으로
        </button>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="w-[360px] rounded-xl bg-white p-8 text-center">
            <p className="mb-2 text-base font-bold">문의를 삭제하시겠습니까?</p>
            <p className="mb-6 text-sm text-slate-500">삭제된 문의는 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white p-3">취소</button>
              <button onClick={del} className="flex-1 cursor-pointer rounded-lg border-none bg-red-500 p-3 font-semibold text-white">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
