import { useState } from 'react'
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

  const submit = async (e) => {
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
      await authApi.confirmResetPassword({ token, newPassword: form.newPassword })
      setDone(true)
    } catch (err) {
      setError(err?.message || '비밀번호 재설정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  // 토큰 없이 접근한 경우
  if (!token) {
    return (
      <div style={centerStyle}>
        <div style={cardStyle}>
          <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, marginBottom: 16 }}>잘못된 접근입니다</h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#334155', textAlign: 'center' }}>
            비밀번호 재설정 링크가 올바르지 않습니다.<br />비밀번호 찾기를 다시 진행해주세요.
          </p>
          <button onClick={() => navigate('/forgot-password')} style={btnStyle}>비밀번호 찾기</button>
        </div>
      </div>
    )
  }

  return (
    <div style={centerStyle}>
      {done && (
        <div style={overlayStyle} onClick={() => navigate('/login')}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>비밀번호 변경 완료</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#334155', textAlign: 'center' }}>
              비밀번호가 변경되었습니다.<br />새 비밀번호로 로그인해주세요.
            </p>
            <button onClick={() => navigate('/login')} style={btnStyle}>로그인하기</button>
          </div>
        </div>
      )}
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 32 }}>비밀번호 재설정</h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>새 비밀번호 *</label>
            <input type="password" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
              placeholder="8자 이상" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>새 비밀번호 확인 *</label>
            <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="재입력" style={inputStyle} />
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={submitting} style={{ ...btnStyle, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? '처리 중...' : '비밀번호 변경'}
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
