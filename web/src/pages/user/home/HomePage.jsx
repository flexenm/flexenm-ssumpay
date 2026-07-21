import { useNavigate } from 'react-router-dom'
import { Tv2, Gamepad2, BookOpen, Gift } from 'lucide-react'

const categories = [
  { key: 'broadcast', label: '방송', desc: '플렉스티비·SOOP·투네이션 등', Icon: Tv2 },
  { key: 'game', label: '게임', desc: '리그오브레전드·메이플스토리·원신 등', Icon: Gamepad2 },
  { key: 'webtoon', label: '웹툰', desc: '네이버웹툰·카카오웹툰 등', Icon: BookOpen },
  { key: 'giftcard', label: '상품권', desc: '문화상품권·해피머니·도서상품권 등', Icon: Gift },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)', padding: '80px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '100%' }}>
        <div>
          <h1 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.3, color: '#1e293b' }}>
            <span style={{ color: '#2563eb' }}>간편</span>하고 <span style={{ color: '#2563eb' }}>안전한 결제,</span><br />
            썸페이와 함께하세요
          </h1>
          <p style={{ color: '#64748b', marginTop: 16, fontSize: 16 }}>방송, 게임, 웹툰, 상품권까지<br />모든 결제를 썸페이에서 한번에 해결할 수 있어요</p>
        </div>
        <div style={{ fontSize: 80 }}>💰</div>
      </div>

      {/* Categories */}
      <div style={{ maxWidth: 1100, margin: '60px auto', padding: '0 40px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>원하는 서비스를</h2>
        <p style={{ textAlign: 'center', color: '#2563eb', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>빠르고 안전하게 결제하세요</p>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 48 }}>방송, 게임, 웹툰, 상품권까지 모두 한번에!</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {categories.map(c => (
            <div key={c.key} onClick={() => navigate(`/products?category=${c.key}`)}
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 32, textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #dbeafe, #eff6ff)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <c.Icon size={36} color="#2563eb" strokeWidth={1.5} />
                </div>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{c.label}</h3>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>{c.desc}</p>
              <button style={{ padding: '6px 16px', border: '1px solid #2563eb', borderRadius: 20, color: '#2563eb', background: 'none', cursor: 'pointer', fontSize: 13 }}>
                상품 보러가기 &gt;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
