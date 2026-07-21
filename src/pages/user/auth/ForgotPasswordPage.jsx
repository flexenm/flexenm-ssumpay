import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../../api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '' })
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
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
    <div style={centerStyle}>
      {done && (
        <div style={overlayStyle} onClick={() => navigate('/login')}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>비밀번호 찾기 안내</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#334155', textAlign: 'center' }}>
              입력하신 정보로 가입된 계정이 있다면,<br />임시 비밀번호를 메일로 보내드렸습니다.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
              메일이 도착하지 않으면 아이디와 이메일을<br />다시 확인해주세요.
            </p>
            <button onClick={() => navigate('/login')} style={btnStyle}>로그인으로 돌아가기</button>
          </div>
        </div>
      )}
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
          <button type="submit" disabled={submitting} style={{ ...btnStyle, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? '처리 중...' : '비밀번호 찾기'}
          </button>
        </form>
      </div>
    </div>
  )
}

const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', background: '#f8fafc' }
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }
const modalStyle = { background: '#fff', borderRadius: 16, padding: 40, width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }
const cardStyle = { background: '#fff', borderRadius: 16, padding: 48, width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }
const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
const btnStyle = { padding: 14, background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 8 }
