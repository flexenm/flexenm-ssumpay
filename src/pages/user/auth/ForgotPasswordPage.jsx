import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../../api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '' })
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    await authApi.resetPassword(form)
    setDone(true)
  }

  if (done) return (
    <div style={centerStyle}>
      <div style={cardStyle}>
        <p style={{ textAlign: 'center', fontSize: 16 }}>입력하신 이메일로 임시 비밀번호를 발송했습니다.</p>
        <button onClick={() => navigate('/login')} style={btnStyle}>로그인으로 돌아가기</button>
      </div>
    </div>
  )

  return (
    <div style={centerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 32 }}>비밀번호 찾기</h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>아이디 *</label>
            <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              placeholder="아이디 입력 (영문+숫자 4~16자)" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>이메일 *</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="example@email.com" style={inputStyle} />
          </div>
          <button type="submit" style={btnStyle}>비밀번호 찾기</button>
        </form>
      </div>
    </div>
  )
}

const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', background: '#f8fafc' }
const cardStyle = { background: '#fff', borderRadius: 16, padding: 48, width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }
const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
const btnStyle = { padding: 14, background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 8 }
