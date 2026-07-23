import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { noticesApi } from '../../../api'
import type { Notice } from '../../../types'

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    noticesApi.get(id!).then(r => setNotice(r.data)).catch(() => navigate('/customer'))
  }, [id])

  if (!notice) return <div className="p-20 text-center">로딩중...</div>

  return (
    <div className="mx-auto max-w-[800px] px-6 py-10">
      <p className="mb-4 text-[13px] text-slate-400">홈 &gt; 고객센터 &gt; 공지사항</p>
      <h1 className="mb-10 text-center text-[32px] font-bold">고객센터</h1>
      <div className="border-t-2 border-slate-800 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-blue-600">📌</span>
            <h2 className="text-xl font-bold">{notice.title}</h2>
          </div>
          <span className="text-sm text-slate-400">{new Date(notice.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="min-h-[200px] border-t border-gray-200 pt-6 leading-[1.8] text-gray-700">
          {notice.content}
        </div>
      </div>
      <div className="mt-12 text-center">
        <button onClick={() => navigate('/customer')} className="cursor-pointer rounded-lg border-none bg-slate-800 px-10 py-3 text-[15px] text-white">목록으로</button>
      </div>
    </div>
  )
}
