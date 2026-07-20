import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { inquiriesApi } from '../../../api'

export default function InquiryFormPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ type: '', title: '', content: '' })
  const typeSelected = form.type !== ''
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!typeSelected || !form.title || !form.content) { setError('모든 항목을 입력해주세요.'); return }
    try {
      await inquiriesApi.create(form)
      alert('문의가 등록되었습니다.')
      navigate('/customer')
    } catch (err) {
      setError(err.message || '문의 등록에 실패했습니다.')
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>홈 &gt; 고객센터 &gt; 1:1문의</p>
      <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>고객센터</h1>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }}>1:1 문의 작성</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={labelStyle}>문의 유형 *</label>
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: Number(e.target.value) }))} style={{ ...inputStyle }}>
            <option value="">문의 유형 선택 (충전/결제/취소·환불/기타)</option>
            <option value={1}>충전</option>
            <option value={2}>결제</option>
            <option value={3}>취소·환불</option>
            <option value={4}>기타</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>제목 *</label>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="제목을 입력해주세요" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>문의 내용 *</label>
          <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            placeholder="문의 내용을 입력해 주세요.&#10;충전 관련 문의 시 주문번호와 플렉스티비 아이디를 함께 적어주시면 빠른 처리가 가능합니다."
            rows={8} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button type="button" onClick={() => navigate(-1)} style={{ padding: '12px 40px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 15 }}>취소</button>
          <button type="submit" style={{ padding: '12px 40px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>등록하기</button>
        </div>
      </form>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }
const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
