import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, PenLine } from 'lucide-react'
import { mypageApi, ordersApi, inquiriesApi } from '../../../api'
import type { Member, Order, Inquiry } from '../../../types'

const tabs = ['내 정보', '구매 내역', '1:1 문의 내역']
const breadcrumbs = ['내정보', '구매내역', '1:1문의내역']

export default function MyPage() {
  const [tab, setTab] = useState(0)
  const [info, setInfo] = useState<Member | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    mypageApi.get().then(r => setInfo(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (tab === 1) {
      setLoading(true)
      ordersApi.my().then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false))
    }
    if (tab === 2) {
      setLoading(true)
      inquiriesApi.list().then(r => setInquiries(r.data)).catch(() => {}).finally(() => setLoading(false))
    }
  }, [tab])

  const changePassword = async (e: FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.newPassword !== pwForm.newPasswordConfirm) {
      setPwError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    try {
      await mypageApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwSuccess('비밀번호가 변경되었습니다.')
      setPwForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
    } catch (err) {
      setPwError((err as { message?: string })?.message || '비밀번호 변경에 실패했습니다.')
    }
  }

  const infoRows: [string, string][] = info ? [['아이디', info.username], ['이메일', info.email]] : []
  const pwFields: [keyof typeof pwForm, string, string][] = [
    ['currentPassword', '현재 비밀번호', '현재 비밀번호 입력'],
    ['newPassword', '새 비밀번호', '8자 이상, 영문+숫자+특수문자'],
    ['newPasswordConfirm', '새 비밀번호 확인', '재입력'],
  ]

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      {/* Breadcrumb */}
      <p className="mb-2 text-[13px] text-slate-400">
        홈 &gt; 마이페이지 &gt; {breadcrumbs[tab]}
      </p>
      <h1 className="mb-2 text-center text-[32px] font-bold">마이페이지</h1>
      <p className="mb-10 text-center text-slate-400">회원 정보를 관리하고 다양한 서비스를 이용해보세요</p>

      {/* Tabs */}
      <div className="mb-12 flex justify-center gap-2">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`cursor-pointer rounded-3xl border-none px-10 py-2.5 text-[15px] font-semibold ${tab === i ? 'bg-blue-600 text-white' : 'bg-slate-100 text-gray-700'}`}>{t}</button>
        ))}
      </div>

      {/* 내 정보 */}
      {tab === 0 && info && (
        <div className="mx-auto max-w-[620px]">
          {/* 회원 정보 */}
          <h2 className="mb-4 text-base font-bold">회원 정보</h2>
          <div className="mb-8 border-t border-gray-200">
            {infoRows.map(([label, value]) => (
              <div key={label} className="flex items-center border-b border-slate-100 py-3.5">
                <span className="w-[100px] text-sm text-slate-500">{label}</span>
                <div className="flex-1 rounded-lg bg-slate-50 px-4 py-2.5 text-sm text-gray-700">{value}</div>
                <div className="ml-3 flex items-center gap-1 whitespace-nowrap text-[13px] text-slate-400">
                  <Lock size={13} /> 변경 불가
                </div>
              </div>
            ))}
            <p className="mt-2 text-xs text-slate-400">※ 아이디·이메일은 변경할 수 없습니다.</p>
          </div>

          {/* 비밀번호 변경 */}
          <h2 className="mb-4 text-base font-bold">비밀번호 변경</h2>
          <div className="border-t border-gray-200">
            <form onSubmit={changePassword}>
              {pwFields.map(([key, label, placeholder]) => (
                <div key={key} className="flex items-center border-b border-slate-100 py-3.5">
                  <span className="w-[120px] shrink-0 text-sm text-slate-500">{label}</span>
                  <input
                    type="password"
                    value={pwForm[key]}
                    onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="flex-1 rounded-lg border border-gray-200 bg-slate-50 px-4 py-2.5 text-sm outline-none"
                  />
                </div>
              ))}
              {pwError && <p className="mt-2 text-[13px] text-red-500">{pwError}</p>}
              {pwSuccess && <p className="mt-2 text-[13px] text-[#22c55e]">{pwSuccess}</p>}
              <div className="mt-5 flex justify-end">
                <button type="submit" className="cursor-pointer rounded-lg border-none bg-slate-800 px-8 py-3 text-sm font-semibold text-white">
                  비밀번호 변경
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 구매 내역 */}
      {tab === 1 && (
        <div>
          {loading ? (
            <p className="p-[60px] text-center text-slate-400">불러오는 중...</p>
          ) : orders.length === 0 ? (
            <p className="p-[60px] text-center text-slate-400">구매 내역이 없습니다.</p>
          ) : (
            <table className="w-full overflow-hidden rounded-xl border border-gray-200 border-collapse bg-white">
              <thead>
                <tr className="border-b border-gray-200">
                  {['주문 일시', '주문번호', '상품', '금액', '상태'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-center text-sm font-semibold text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-slate-100">
                    <td className={tdClass}>{new Date(o.createdAt).toLocaleString()}</td>
                    <td className={tdClass}>{o.orderNo}</td>
                    <td className={tdClass}>{o.productName}</td>
                    <td className={tdClass}>{o.price?.toLocaleString()}원</td>
                    <td className={`${tdClass} text-center`}>
                      <span className={`rounded-2xl px-3.5 py-[5px] text-[13px] font-semibold ${o.chargeStatus === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {o.chargeStatus === 1 ? '충전 완료' : '충전 대기'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 1:1 문의 내역 */}
      {tab === 2 && (
        <div className="mx-auto max-w-[760px]">
          <div className="mb-4 flex justify-end">
            <button onClick={() => navigate('/customer/inquiries/new')}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-slate-800 px-5 py-[9px] text-sm text-white">
              <PenLine size={15} /> 문의하기
            </button>
          </div>
          {loading ? (
            <p className="p-[60px] text-center text-slate-400">불러오는 중...</p>
          ) : inquiries.length === 0 ? (
            <p className="p-[60px] text-center text-slate-400">문의 내역이 없습니다.</p>
          ) : (
            inquiries.map(q => (
              <div key={q.id} onClick={() => navigate(`/mypage/inquiries/${q.id}`)} className="flex cursor-pointer items-center justify-between border-b border-gray-200 py-[18px]">
                <div className="flex items-center gap-3">
                  <span className={`whitespace-nowrap rounded-2xl px-3 py-1 text-xs font-semibold ${q.status === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {q.status === 1 ? '답변 완료' : '답변 대기'}
                  </span>
                  <span className="text-[15px]">{q.title}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-[13px] text-slate-400">
                  {new Date(q.createdAt).toLocaleString()} &gt;
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const tdClass = 'px-4 py-3.5 text-center text-sm'
