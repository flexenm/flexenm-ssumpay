import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CreditCard, Mail } from 'lucide-react'
import { productsApi, ordersApi } from '../../../api'

export default function OrderPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [form, setForm] = useState({ flexUsername: '', flexPassword: '', paymentMethod: 1 })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    productsApi.get(productId).then(r => setProduct(r.data)).catch(() => navigate('/products'))
  }, [productId])

  const submit = async () => {
    if (!form.flexUsername) { setError('플렉스티비 아이디를 입력해주세요.'); return }
    if (!form.flexPassword) { setError('플렉스티비 비밀번호를 입력해주세요.'); return }
    if (!agreed) { setError('이용약관에 동의해주세요.'); return }
    setError('')
    try {
      const res = await ordersApi.create({ productId: Number(productId), flexUsername: form.flexUsername, flexPassword: form.flexPassword, paymentMethod: form.paymentMethod })
      navigate(`/order/complete/${res.data.orderNo}`)
    } catch (err) {
      setError(err.message || '주문에 실패했습니다.')
    }
  }

  if (!product) return <div style={{ padding: 80, textAlign: 'center' }}>로딩중...</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>홈 &gt; 상품목록 &gt; 주문/결제</p>
      <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>주문/결제</h1>
      <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 48 }}>안전한 결제를 위해 주문 정보를 확인해주세요</p>

      {/* 주문 상품 */}
      <Section num={1} title="주문 상품">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#f8fafc', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, background: '#1e293b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>F</div>
            <div>
              <p style={{ fontWeight: 600 }}>{product.name}</p>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>수량: 1개</p>
            </div>
          </div>
          <span style={{ fontWeight: 700, color: '#2563eb', fontSize: 18 }}>{product.price.toLocaleString()}원</span>
        </div>
      </Section>

      {/* 충전 계정 */}
      <Section num={2} title="충전 계정 정보">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>플렉스티비 아이디 *</label>
            <input value={form.flexUsername} onChange={e => setForm(p => ({ ...p, flexUsername: e.target.value }))}
              placeholder="충전할 플렉스티비 아이디 입력" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>플렉스티비 비밀번호 *</label>
            <input type="password" value={form.flexPassword} onChange={e => setForm(p => ({ ...p, flexPassword: e.target.value }))}
              placeholder="충전할 플렉스티비 비밀번호 입력" style={inputStyle} />
          </div>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>※ 입력한 아이디로 충전이 진행됩니다. 오입력 시 복구/환불이 어려우니 다시 확인해 주세요.</p>
      </Section>

      {/* 결제 수단 */}
      <Section num={3} title="결제 수단">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { value: 1, label: '신용카드', Icon: CreditCard },
            { value: 2, label: '무통장', Icon: Mail },
          ].map(m => (
            <div key={m.value} onClick={() => setForm(p => ({ ...p, paymentMethod: m.value }))}
              style={{ padding: 24, border: `2px solid ${form.paymentMethod === m.value ? '#2563eb' : '#e5e7eb'}`, borderRadius: 8, textAlign: 'center', cursor: 'pointer', position: 'relative', background: form.paymentMethod === m.value ? '#eff6ff' : '#fff' }}>
              {form.paymentMethod === m.value && (
                <span style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, background: '#2563eb', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <m.Icon size={28} color="#2563eb" strokeWidth={1.5} />
              </div>
              <p style={{ color: '#2563eb' }}>{m.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 최종 금액 */}
      <div style={{ background: '#2563eb', color: '#fff', borderRadius: 8, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 600 }}>최종 결제 금액</span>
        <span style={{ fontSize: 22, fontWeight: 700 }}>{product.price.toLocaleString()}원</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} id="agree" />
        <label htmlFor="agree" style={{ fontSize: 14, color: '#374151' }}>주문 내용을 확인하였으며, <span style={{ color: '#2563eb' }}>이용약관</span> 및 <span style={{ color: '#2563eb' }}>개인정보처리방침</span>에 동의합니다.</label>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <button onClick={submit} style={{ width: '100%', padding: 16, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
          {product.price.toLocaleString()}원 결제하기
        </button>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>상품 목록으로 돌아가기</button>
      </div>
    </div>
  )
}

function Section({ num, title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ background: '#2563eb', color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{num}</span>
        {title}
      </h2>
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>{children}</div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }
const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
