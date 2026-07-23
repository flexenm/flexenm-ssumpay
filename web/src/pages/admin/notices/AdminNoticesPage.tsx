import { useState, useEffect } from 'react'
import { adminNoticesApi } from '../../../api'
import type { NoticeInput } from '../../../api'
import type { Notice } from '../../../types'

interface NoticeForm {
  title: string
  content: string
  isPinned: boolean | 0 | 1
  isActive: number
}

type ModalType = 'create' | 'edit' | 'view' | 'delete'

const empty: NoticeForm = { title: '', content: '', isPinned: false, isActive: 1 }

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalType | null>(null)
  const [form, setForm] = useState<NoticeForm>(empty)
  const [selected, setSelected] = useState<Notice | null>(null)

  const load = () => { setLoading(true); return adminNoticesApi.list().then(r => setNotices(r.data)).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(empty); setModal('create') }
  const openEdit = (n: Notice) => { setForm(n); setSelected(n); setModal('edit') }
  const openView = (n: Notice) => { setSelected(n); setModal('view') }
  const openDelete = (n: Notice) => { setSelected(n); setModal('delete') }

  const save = async () => {
    try {
      if (modal === 'create') await adminNoticesApi.create(form as unknown as NoticeInput)
      else await adminNoticesApi.update(selected!.id, form as unknown as NoticeInput)
      setModal(null); load()
    } catch (e) {
      alert((e as { message?: string })?.message || '저장 중 오류가 발생했습니다.')
    }
  }

  const del = async () => {
    try {
      await adminNoticesApi.delete(selected!.id)
      setModal(null); load()
    } catch (e) {
      alert((e as { message?: string })?.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <button onClick={openCreate} className="px-5 py-2.5 bg-slate-800 text-white border-none rounded-lg cursor-pointer text-sm">+ 공지 등록</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse">
          <thead><tr className="bg-slate-50">
            {['고정', '제목', '상태', '조회수', '등록일', '관리'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[13px] font-semibold">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} className="p-10 text-center text-slate-400">불러오는 중...</td></tr>
              : notices.length === 0
              ? <tr><td colSpan={6} className="p-10 text-center text-slate-400">공지사항이 없습니다.</td></tr>
              : notices.map(n => (
                <tr key={n.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-[13px]">{n.isPinned ? '📌' : ''}</td>
                  <td className="px-4 py-3 text-[13px] cursor-pointer text-blue-600" onClick={() => openView(n)}>{n.title}</td>
                  <td className="px-4 py-3 text-[13px]"><span className={`px-2.5 py-[3px] rounded-[10px] text-xs ${n.isActive ? 'bg-green-100 text-[#16a34a]' : 'bg-slate-100 text-slate-400'}`}>{n.isActive ? '공개' : '비공개'}</span></td>
                  <td className="px-4 py-3 text-[13px]">{n.viewCount}</td>
                  <td className="px-4 py-3 text-[13px]">{new Date(n.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-[13px]">
                    <button onClick={() => openEdit(n)} className="mr-1.5 px-2.5 py-1 border border-gray-200 rounded-md cursor-pointer text-xs">수정</button>
                    <button onClick={() => openDelete(n)} className="px-2.5 py-1 border border-[#fca5a5] text-[#dc2626] rounded-md cursor-pointer text-xs bg-white">삭제</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
          <div className="bg-white rounded-2xl p-8 w-[480px] max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-bold mb-5">{modal === 'create' ? '공지 등록' : '공지 수정'}</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-semibold mb-1">제목</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[13px] outline-none box-border" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1">내용</label>
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[13px] outline-none box-border resize-y" />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isPinned as boolean} onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))} />고정
                </label>
                <select value={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: Number(e.target.value) }))} className="px-3 py-1.5 border border-gray-200 rounded-md">
                  <option value={1}>공개</option>
                  <option value={0}>비공개</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(null)} className="px-6 py-2.5 border border-gray-200 rounded-lg cursor-pointer">취소</button>
              <button onClick={save} className="px-6 py-2.5 bg-blue-600 text-white border-none rounded-lg cursor-pointer">저장</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
          <div className="bg-white rounded-2xl p-8 w-[600px] max-h-[80vh] overflow-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold">{selected.title}</h3>
              <span className="text-slate-400 text-[13px]">{new Date(selected.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="border-t border-gray-200 pt-4 min-h-[120px] leading-[1.8]">{selected.content}</div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(null)} className="px-6 py-2.5 border border-gray-200 rounded-lg cursor-pointer">닫기</button>
              <button onClick={() => openEdit(selected)} className="px-6 py-2.5 bg-blue-600 text-white border-none rounded-lg cursor-pointer">수정</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'delete' && selected && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
          <div className="bg-white rounded-2xl p-8 w-[400px] max-h-[80vh] overflow-auto text-center">
            <p className="font-bold text-lg mb-3">공지를 삭제하시겠습니까?</p>
            <p className="text-slate-500 text-sm mb-6">삭제된 공지는 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 p-3 border border-gray-200 rounded-lg cursor-pointer bg-white">취소</button>
              <button onClick={del} className="flex-1 p-3 bg-slate-800 text-white border-none rounded-lg cursor-pointer font-semibold">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
