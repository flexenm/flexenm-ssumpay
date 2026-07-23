import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminInquiriesApi } from '../../../api'
import type { Inquiry, Member } from '../../../types'

interface AdminInquiry extends Inquiry {
  member?: Member
}

export default function AdminInquiryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [inquiry, setInquiry] = useState<AdminInquiry | null>(null)
  const [answer, setAnswer] = useState('')

  useEffect(() => {
    adminInquiriesApi.get(id!).then(r => { setInquiry(r.data); setAnswer(r.data.answer || '') }).catch(() => navigate('/admin/inquiries'))
  }, [id])

  const submit = async () => {
    if (!answer) return alert('답변을 입력해주세요.')
    try {
      await adminInquiriesApi.answer(id!, { answer })
      alert('답변이 등록되었습니다.')
      navigate('/admin/inquiries')
    } catch (e) {
      alert((e as { message?: string })?.message || '답변 등록 중 오류가 발생했습니다.')
    }
  }

  if (!inquiry) return <div>로딩중...</div>

  const rows: [string, string | number | undefined][] = [
    ['상태', inquiry.status === 1 ? '답변완료' : '답변대기'],
    ['유형', inquiry.type],
    ['작성자', inquiry.member?.username],
    ['등록일', new Date(inquiry.createdAt).toLocaleString()],
  ]

  return (
    <div className="max-w-[800px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">1:1 문의 답변</h1>
        <button onClick={() => navigate('/admin/inquiries')} className="px-5 py-2 border border-gray-200 rounded-lg cursor-pointer bg-white">목록으로</button>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-5">
        <div className="flex gap-6 mb-4 flex-wrap">
          {rows.map(([k, v]) => (
            <div key={k}>
              <span className="text-slate-400 text-[13px]">{k}: </span>
              <span className="font-semibold text-[13px]">{v}</span>
            </div>
          ))}
        </div>
        <h2 className="text-lg font-bold mb-3">{inquiry.title}</h2>
        <div className="bg-slate-50 rounded-lg p-4 leading-[1.8] min-h-[100px]">{inquiry.content}</div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-base font-bold mb-4">관리자 답변</h3>
        <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={8}
          placeholder="답변 내용을 입력하세요." disabled={inquiry.status === 1}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none resize-y box-border" />
        {inquiry.status === 0 && (
          <div className="flex justify-end mt-4 gap-3">
            <button onClick={() => navigate('/admin/inquiries')} className="px-6 py-2.5 border border-gray-200 rounded-lg cursor-pointer">취소</button>
            <button onClick={submit} className="px-6 py-2.5 bg-blue-600 text-white border-none rounded-lg cursor-pointer">답변 등록</button>
          </div>
        )}
      </div>
    </div>
  )
}
