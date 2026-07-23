import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminInquiriesApi } from '../../../api'
import type { ListParams } from '../../../api'
import type { Inquiry, Member } from '../../../types'

interface AdminInquiry extends Inquiry {
  member?: Member
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  const load = (s = status) => { setLoading(true); return adminInquiriesApi.list({ status: s } as ListParams).then(r => setInquiries(r.data)).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { load('') }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">1:1 문의 관리</h1>
      <div className="bg-white rounded-xl p-5 border border-gray-200 mb-5 flex gap-3">
        <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none">
          <option value="">전체</option>
          <option value="0">답변 대기</option>
          <option value="1">답변 완료</option>
        </select>
        <button onClick={() => load(status)} className="px-5 py-2 bg-slate-800 text-white border-none rounded-lg cursor-pointer text-sm">조회</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse">
          <thead><tr className="bg-slate-50">
            {['상태', '유형', '제목', '회원', '등록일', '답변일'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[13px] font-semibold">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} className="p-10 text-center text-slate-400">불러오는 중...</td></tr>
              : inquiries.length === 0
              ? <tr><td colSpan={6} className="p-10 text-center text-slate-400">데이터가 없습니다.</td></tr>
              : inquiries.map(q => (
                <tr key={q.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-[13px]"><span className={`px-2.5 py-[3px] rounded-[10px] text-xs ${q.status === 1 ? 'bg-green-100 text-[#16a34a]' : 'bg-[#fef9c3] text-[#ca8a04]'}`}>{q.status === 1 ? '답변완료' : '답변대기'}</span></td>
                  <td className="px-4 py-3 text-[13px]">{q.type}</td>
                  <td className="px-4 py-3 text-[13px]">
                    <Link to={`/admin/inquiries/${q.id}`} className="text-blue-600 no-underline">{q.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-[13px]">{q.member?.username || '-'}</td>
                  <td className="px-4 py-3 text-[13px]">{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-[13px]">{q.answeredAt ? new Date(q.answeredAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
