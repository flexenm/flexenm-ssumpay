import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../../../api'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError('')

    if (form.newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    setSubmitting(true)
    try {
      await authApi.confirmResetPassword({ token: token!, newPassword: form.newPassword })
      setDone(true)
    } catch (err) {
      setError((err as { message?: string })?.message || '비밀번호 재설정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  // 토큰 없이 접근한 경우
  if (!token) {
    return (
      <div className={centerClass}>
        <div className={cardClass}>
          <h2 className="mb-4 text-center text-2xl font-bold">잘못된 접근입니다</h2>
          <p className="text-center text-[15px] leading-[1.6] text-slate-700">
            비밀번호 재설정 링크가 올바르지 않습니다.<br />비밀번호 찾기를 다시 진행해주세요.
          </p>
          <button onClick={() => navigate('/forgot-password')} className={`${btnClass} cursor-pointer`}>비밀번호 찾기</button>
        </div>
      </div>
    )
  }

  return (
    <div className={centerClass}>
      {done && (
        <div className={overlayClass} onClick={() => navigate('/login')}>
          <div className={modalClass} onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-center text-xl font-bold">비밀번호 변경 완료</h3>
            <p className="text-center text-[15px] leading-[1.6] text-slate-700">
              비밀번호가 변경되었습니다.<br />새 비밀번호로 로그인해주세요.
            </p>
            <button onClick={() => navigate('/login')} className={`${btnClass} cursor-pointer`}>로그인하기</button>
          </div>
        </div>
      )}
      <div className={cardClass}>
        <h2 className="mb-8 text-center text-[28px] font-bold">비밀번호 재설정</h2>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>새 비밀번호 *</label>
            <input type="password" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
              placeholder="8자 이상" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>새 비밀번호 확인 *</label>
            <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="재입력" className={inputClass} />
          </div>
          {error && <p className="m-0 text-[13px] text-[#dc2626]">{error}</p>}
          <button type="submit" disabled={submitting} className={`${btnClass} ${submitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'}`}>
            {submitting ? '처리 중...' : '비밀번호 변경'}
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
