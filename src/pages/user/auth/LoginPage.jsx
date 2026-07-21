import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../../api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const submit = async (e) => {
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', background: '#f8fafc' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 48, width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>로그인</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, marginBottom: 32 }}>오늘도 빠르고 안전한 결제 서비스를 제공하겠습니다</p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            placeholder="아이디 입력" style={inputStyle} />
          <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            placeholder="비밀번호 입력" style={inputStyle} />
          {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
          <button type="submit" style={btnStyle}>로그인</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#94a3b8' }}>
          <Link to="/register" style={{ color: '#94a3b8' }}>회원가입</Link>
          &nbsp;|&nbsp;
          <Link to="/forgot-password" style={{ color: '#94a3b8' }}>비밀번호 찾기</Link>
        </div>
      </div>
    </div>
  )
}

const inputStyle = { padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }
const btnStyle = { padding: '14px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }
