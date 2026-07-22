import { useParams, useNavigate } from 'react-router-dom'
import { Check, Info } from 'lucide-react'

export default function OrderCompletePage() {
  const { orderNo } = useParams()
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ width: 100, height: 100, background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <div style={{ width: 64, height: 64, background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={36} color="#fff" strokeWidth={3} />
        </div>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>결제가 완료되었습니다</h1>
      <p style={{ color: '#94a3b8', marginBottom: 48 }}>이용해주셔서 감사합니다</p>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24, textAlign: 'left' }}>
        <p style={{ fontWeight: 700, marginBottom: 12 }}>주문 상품</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#1e293b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>F</div>
            <div>
              <p style={{ fontWeight: 600 }}>주문번호: {orderNo}</p>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>수량: 1개</p>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: 16, background: '#eff6ff', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Info size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontWeight: 600, color: '#1e40af', fontSize: 14 }}>결제 완료 후 최대 30분 내 처리됩니다</p>
            <p style={{ color: '#64748b', fontSize: 13 }}>렉스 충전은 결제 완료 후 최대 30분 내 처리됩니다. 충전이 지연될 경우 고객센터로 문의해 주세요.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
        <button onClick={() => navigate('/mypage')} style={{ padding: '12px 32px', border: '2px solid #1e293b', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600 }}>구매 내역 보기</button>
        <button onClick={() => navigate('/')} style={{ padding: '12px 32px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>홈으로</button>
      </div>
    </div>
  )
}
