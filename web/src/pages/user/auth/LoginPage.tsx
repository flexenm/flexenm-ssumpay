import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../../api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await authApi.login(form)
      localStorage.setItem('token', res.token)
      navigate('/')
    } catch {
      // 계정 열거 방지: 계정 없음 / 비밀번호 불일치를 구분하지 않고 항상 동일 메시지 노출
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
      <div className="w-[400px] rounded-2xl bg-white p-12 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <h2 className="mb-2 text-center text-[28px] font-bold">로그인</h2>
        <p className="mb-8 text-center text-sm text-slate-400">오늘도 빠르고 안전한 결제 서비스를 제공하겠습니다</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            placeholder="아이디 입력" className={inputClass} />
          <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            placeholder="비밀번호 입력" className={inputClass} />
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <button type="submit" className={btnClass}>로그인</button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-400">
          <Link to="/register" className="text-slate-400">회원가입</Link>
          &nbsp;|&nbsp;
          <Link to="/forgot-password" className="text-slate-400">비밀번호 찾기</Link>
        </div>
        <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-[13px] text-slate-600">
          <p className="mb-2 font-semibold text-slate-700">테스트 계정</p>
          <p>아이디: <span className="font-medium text-slate-800">testuser2</span></p>
          <p>비밀번호: <span className="font-medium text-slate-800">test1234</span></p>
          <button type="button" onClick={() => setForm({ username: 'testuser2', password: 'test1234' })}
            className="mt-3 cursor-pointer rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600">
            자동입력
          </button>
        </div>
      </div>
    </div>
  )
}

const inputClass = 'rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none'
const btnClass = 'cursor-pointer rounded-lg border-none bg-slate-800 p-3.5 text-[15px] font-semibold text-white'
