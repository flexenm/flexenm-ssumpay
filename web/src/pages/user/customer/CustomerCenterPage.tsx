import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PenLine, Tag } from 'lucide-react'
import { noticesApi, inquiriesApi } from '../../../api'
import type { Notice, Inquiry } from '../../../types'

export default function CustomerCenterPage() {
  const [tab, setTab] = useState(0)
  const [notices, setNotices] = useState<Notice[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const isLoggedIn = !!localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    noticesApi.list().then(r => setNotices(r.data)).catch(() => {}).finally(() => setLoading(false))
    if (isLoggedIn) inquiriesApi.list().then(r => setInquiries(r.data)).catch(() => {})
  }, [])

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <p className="mb-2 text-[13px] text-slate-400">홈 &gt; 고객센터 &gt; 공지사항</p>
      <h1 className="mb-2 text-center text-[32px] font-bold">고객센터</h1>
      <p className="mb-10 text-center text-slate-400">공지사항을 확인하고 궁금한 점은 언제든 문의해보세요</p>

      <div className="mb-10 flex justify-center gap-2">
        {['공지사항', '1:1 문의'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`cursor-pointer rounded-3xl border-none px-12 py-2.5 text-[15px] font-semibold ${tab === i ? 'bg-blue-600 text-white' : 'bg-slate-100 text-gray-700'}`}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        loading
          ? <div className="rounded-xl bg-slate-50 p-20 text-center text-slate-400">불러오는 중...</div>
          : notices.length === 0
          ? <div className="rounded-xl bg-slate-50 p-20 text-center text-slate-400">
              <p className="mb-2 text-[32px]">!</p>등록된 공지사항이 없습니다.
            </div>
          : notices.map(n => (
            <Link key={n.id} to={`/customer/notices/${n.id}`} className="flex items-center justify-between border-b border-gray-200 py-[18px] text-slate-800 no-underline">
              <div className="flex items-center gap-3">
                <Tag size={15} color="#2563eb" strokeWidth={2} />
                <span className={n.isPinned ? 'font-bold' : 'font-normal'}>{n.title}</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-slate-400">
                {new Date(n.createdAt).toLocaleDateString()} <span>&gt;</span>
              </div>
            </Link>
          ))
      )}

      {tab === 1 && (
        <div>
          {isLoggedIn && (
            <div className="mb-4 flex justify-end">
              <button onClick={() => navigate('/customer/inquiries/new')} className="cursor-pointer rounded-lg border-none bg-slate-800 px-5 py-2 text-white"><PenLine size={15} /> 문의하기</button>
            </div>
          )}
          {inquiries.map(q => (
            <div key={q.id} onClick={() => navigate(`/mypage/inquiries/${q.id}`)} className="flex cursor-pointer items-center justify-between border-b border-gray-200 py-4">
              <div className="flex items-center gap-3">
                <span className={`rounded-xl px-2.5 py-1 text-xs ${q.status === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{q.status === 1 ? '답변 완료' : '답변 대기'}</span>
                <span>{q.title}</span>
              </div>
              <span className="text-[13px] text-slate-400">{new Date(q.createdAt).toLocaleString()} &gt;</span>
            </div>
          ))}
          {!isLoggedIn && <div className="mt-6 rounded-lg bg-blue-50 p-4 text-center text-sm text-slate-500">ℹ️ 1:1 문의는 로그인 후 이용할 수 있습니다.</div>}
        </div>
      )}
    </div>
  )
}
