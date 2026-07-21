import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAuthApi } from '../../../api'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await adminAuthApi.login(form)
      localStorage.setItem('adminToken', res.token)
      localStorage.setItem('adminInfo', JSON.stringify(res.admin))
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 48, width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, marginBottom: 32 }}>ssumpay ADMIN</h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="아이디" style={inputStyle} />
          <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="비밀번호" style={inputStyle} />
          {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
          <button type="submit" style={{ padding: 14, background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>로그인</button>
        </form>
      </div>
    </div>
  )
}

const inputStyle = { padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }
