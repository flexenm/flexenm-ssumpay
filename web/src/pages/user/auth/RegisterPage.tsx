import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../../api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', passwordConfirm: '', name: '', phone: '', email: '' })
  const [usernameOk, setUsernameOk] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  const checkUsername = async () => {
    if (!form.username) return
    try {
      const res = await authApi.checkUsername(form.username)
      setUsernameOk(res.available)
    } catch { setUsernameOk(false) }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!usernameOk) { setError('아이디 중복확인을 해주세요.'); return }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    try {
      await authApi.register({ username: form.username, password: form.password, name: form.name, phone: form.phone, email: form.email })
      alert('회원가입이 완료되었습니다.')
      navigate('/login')
    } catch (err) {
      setError((err as { message?: string })?.message || '회원가입에 실패했습니다.')
    }
  }

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => { setForm(p => ({ ...p, [key]: e.target.value })); if (key === 'username') setUsernameOk(null) }

  return (
    <div className="flex min-h-[70vh] justify-center bg-slate-50 px-5 py-[60px]">
      <div className="h-fit w-[440px] rounded-2xl bg-white p-12 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <h2 className="mb-2 text-center text-[28px] font-bold">회원가입</h2>
        <p className="mb-8 text-center text-sm text-slate-400">회원이 되시면, 더 다양한 서비스를 이용하실 수 있습니다</p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>아이디 *</label>
            <div className="flex gap-2">
              <input value={form.username} onChange={set('username')} placeholder="아이디 입력 (영문+숫자 4~16자)" className={`${inputClass} flex-1`} />
              <button type="button" onClick={checkUsername} className="cursor-pointer whitespace-nowrap rounded-[20px] border-none bg-blue-600 px-4 py-2.5 text-[13px] text-white">중복확인</button>
            </div>
            {usernameOk === true && <p className="mt-1 text-xs text-[#22c55e]">사용 가능한 아이디입니다.</p>}
            {usernameOk === false && <p className="mt-1 text-xs text-red-500">이미 사용 중인 아이디입니다.</p>}
          </div>
          <div>
            <label className={labelClass}>비밀번호 *</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="비밀번호 입력 (8자 이상, 영문+숫자+특수문자)" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>비밀번호 확인 *</label>
            <input type="password" value={form.passwordConfirm} onChange={set('passwordConfirm')} placeholder="비밀번호 재입력" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>이름 *</label>
            <input value={form.name} onChange={set('name')} placeholder="이름 입력" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>휴대전화 *</label>
            <input value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>이메일 *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="example@email.com" className={inputClass} />
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <button type="submit" className="cursor-pointer rounded-lg border-none bg-slate-800 p-3.5 text-[15px] font-semibold text-white">가입하기</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          이미 계정이 있으신가요? <Link to="/login" className="text-blue-600">로그인</Link>
        </p>
      </div>
    </div>
  )
}

const labelClass = 'mb-1.5 block text-sm font-semibold'
const inputClass = 'box-border w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none'
