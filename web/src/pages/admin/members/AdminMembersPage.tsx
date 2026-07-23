import { useState, useEffect } from 'react'
import { adminMembersApi } from '../../../api'
import type { Member } from '../../../types'

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')

  const load = (kw = keyword) => {
    setLoading(true)
    adminMembersApi.list({ keyword: kw }).then(r => setMembers(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load('') }, [])

  const toggleStatus = async (m: Member) => {
    await adminMembersApi.updateStatus(m.id, { status: m.status === 0 ? 1 : 0 })
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">회원 관리</h1>
      <div className="bg-white rounded-xl p-5 border border-gray-200 mb-5 flex gap-3">
        <input value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(keyword)} placeholder="아이디/이메일 검색" className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none flex-1" />
        <button onClick={() => load(keyword)} className="px-5 py-2 bg-slate-800 text-white border-none rounded-lg cursor-pointer text-sm">조회</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse">
          <thead><tr className="bg-slate-50">
            {['아이디', '이름', '이메일', '전화번호', 'FlexTV', '가입일', '상태', '관리'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[13px] font-semibold">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} className="p-10 text-center text-slate-400">불러오는 중...</td></tr>
              : members.length === 0
              ? <tr><td colSpan={8} className="p-10 text-center text-slate-400">데이터가 없습니다.</td></tr>
              : members.map(m => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-[13px]">{m.username}</td>
                  <td className="px-4 py-3 text-[13px]">{m.name}</td>
                  <td className="px-4 py-3 text-[13px]">{m.email}</td>
                  <td className="px-4 py-3 text-[13px]">{m.phone || '-'}</td>
                  <td className="px-4 py-3 text-[13px]">{m.flexUsername || '-'}</td>
                  <td className="px-4 py-3 text-[13px]">{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-[13px]"><span className={`px-2.5 py-[3px] rounded-[10px] text-xs ${m.status === 0 ? 'bg-green-100 text-[#16a34a]' : 'bg-red-100 text-[#dc2626]'}`}>{m.status === 0 ? '정상' : '차단'}</span></td>
                  <td className="px-4 py-3 text-[13px]">
                    <button onClick={() => toggleStatus(m)} className={`px-3 py-1 border-none rounded-md cursor-pointer text-xs ${m.status === 0 ? 'bg-red-100 text-[#dc2626]' : 'bg-green-100 text-[#16a34a]'}`}>
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
