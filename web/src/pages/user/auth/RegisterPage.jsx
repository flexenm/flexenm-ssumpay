import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../../api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', passwordConfirm: '', name: '', phone: '', email: '' })
  const [usernameOk, setUsernameOk] = useState(null)
  const [error, setError] = useState('')

  const checkUsername = async () => {
    if (!form.username) return
    try {
      const res = await authApi.checkUsername(form.username)
      setUsernameOk(res.available)
    } catch { setUsernameOk(false) }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!usernameOk) { setError('아이디 중복확인을 해주세요.'); return }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    try {
      await authApi.register({ username: form.username, password: form.password, name: form.name, phone: form.phone, email: form.email })
      alert('회원가입이 완료되었습니다.')
      navigate('/login')
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.')
    }
  }

  const set = (key) => (e) => { setForm(p => ({ ...p, [key]: e.target.value })); if (key === 'username') setUsernameOk(null) }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px', background: '#f8fafc', minHeight: '70vh' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 48, width: 440, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', height: 'fit-content' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>회원가입</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, marginBottom: 32 }}>회원이 되시면, 더 다양한 서비스를 이용하실 수 있습니다</p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>아이디 *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={form.username} onChange={set('username')} placeholder="아이디 입력 (영문+숫자 4~16자)" style={{ ...inputStyle, flex: 1 }} />
              <button type="button" onClick={checkUsername} style={{ padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>중복확인</button>
            </div>
            {usernameOk === true && <p style={{ color: '#22c55e', fontSize: 12, marginTop: 4 }}>사용 가능한 아이디입니다.</p>}
            {usernameOk === false && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>이미 사용 중인 아이디입니다.</p>}
          </div>
          <div>
            <label style={labelStyle}>비밀번호 *</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="비밀번호 입력 (8자 이상, 영문+숫자+특수문자)" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>비밀번호 확인 *</label>
            <input type="password" value={form.passwordConfirm} onChange={set('passwordConfirm')} placeholder="비밀번호 재입력" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>이름 *</label>
            <input value={form.name} onChange={set('name')} placeholder="이름 입력" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>휴대전화 *</label>
            <input value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>이메일 *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="example@email.com" style={inputStyle} />
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
          <button type="submit" style={{ padding: 14, background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>가입하기</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#94a3b8' }}>
          이미 계정이 있으신가요? <Link to="/login" style={{ color: '#2563eb' }}>로그인</Link>
        </p>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }
const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
