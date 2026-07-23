import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../../api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '' })
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      // 서버는 계정 존재 여부와 무관하게 동일 응답을 주므로, 실패 여부와 관계없이 동일 안내를 노출한다.
      await authApi.resetPassword(form)
    } catch {
      // 열거 방지: 오류가 나더라도 계정 존재를 드러내지 않도록 동일 안내를 유지
    } finally {
      setSubmitting(false)
      setDone(true)
    }
  }

  return (
    <div className={centerClass}>
      {done && (
        <div className={overlayClass} onClick={() => navigate('/login')}>
          <div className={modalClass} onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-center text-xl font-bold">비밀번호 찾기 안내</h3>
            <p className="text-center text-[15px] leading-[1.6] text-slate-700">
              입력하신 정보로 가입된 계정이 있다면,<br />비밀번호 재설정 링크를 메일로 보내드렸습니다.
            </p>
            <p className="mt-3 text-center text-[13px] leading-[1.6] text-slate-400">
              링크는 30분간 유효합니다. 메일이 도착하지 않으면<br />아이디와 이메일을 다시 확인해주세요.
            </p>
            <button onClick={() => navigate('/login')} className={`${btnClass} cursor-pointer`}>로그인으로 돌아가기</button>
          </div>
        </div>
      )}
      <div className={cardClass}>
        <h2 className="mb-8 text-center text-[28px] font-bold">비밀번호 찾기</h2>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>아이디 *</label>
            <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              placeholder="아이디 입력 (영문+숫자 4~16자)" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>이메일 *</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="example@email.com" className={inputClass} />
          </div>
          <button type="submit" disabled={submitting} className={`${btnClass} ${submitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'}`}>
            {submitting ? '처리 중...' : '비밀번호 찾기'}
          </button>
        </form>
      </div>
    </div>
  )
}

const centerClass = 'flex min-h-[70vh] items-center justify-center bg-slate-50'
const overlayClass = 'fixed inset-0 z-[1000] flex items-center justify-center bg-black/40'
const modalClass = 'w-[360px] rounded-2xl bg-white p-10 shadow-[0_8px_32px_rgba(0,0,0,0.16)]'
const cardClass = 'w-[400px] rounded-2xl bg-white p-12 shadow-[0_4px_24px_rgba(0,0,0,0.08)]'
const labelClass = 'mb-1.5 block text-sm font-semibold'
const inputClass = 'box-border w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none'
const btnClass = 'mt-2 w-full rounded-lg border-none bg-slate-800 p-3.5 text-[15px] font-semibold text-white'
