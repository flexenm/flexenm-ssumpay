import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LayoutGrid, Tv2, Gamepad2, BookOpen, Gift } from 'lucide-react'
import { productsApi } from '../../../api'

const categories = [
  { key: null, label: '전체상품', Icon: LayoutGrid },
  { key: 'broadcast', label: '방송', Icon: Tv2, subs: ['플렉스', 'SOOP', '투네이션', '팝콘티비', '랜더'] },
  { key: 'game', label: '게임', Icon: Gamepad2 },
  { key: 'webtoon', label: '웹툰', Icon: BookOpen },
  { key: 'giftcard', label: '상품권', Icon: Gift },
]

export default function ProductsPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState(params.get('category') || null)
  const [subcategory, setSubcategory] = useState(null)

  useEffect(() => {
    productsApi.list({ category, subcategory }).then(r => setProducts(r.data)).catch(() => setProducts([]))
  }, [category, subcategory])

  const currentCat = categories.find(c => c.key === category)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      {/* Breadcrumb */}
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>홈 &gt; 상품목록</p>

      {/* Category Header */}
      <div style={{ background: 'linear-gradient(135deg, #dbeafe, #eff6ff)', borderRadius: 16, padding: '32px 40px', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 700 }}>{currentCat?.label || '전체상품'}</h1>
          <p style={{ color: '#64748b', marginTop: 8 }}>다양한 {currentCat?.label || ''} 플랫폼 관련 상품을 확인보세요</p>
        </div>
        <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.6)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentCat?.Icon
            ? <currentCat.Icon size={48} color="#2563eb" strokeWidth={1.5} />
            : <LayoutGrid size={48} color="#2563eb" strokeWidth={1.5} />}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 32 }}>
        {/* Sidebar */}
        <aside style={{ width: 200, flexShrink: 0 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <p style={{ fontWeight: 700, marginBottom: 12 }}>카테고리</p>
            {categories.map(c => (
              <div key={c.key}>
                <div onClick={() => { setCategory(c.key); setSubcategory(null) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', cursor: 'pointer', color: category === c.key ? '#2563eb' : '#374151', fontWeight: category === c.key ? 600 : 400 }}>
                  <c.Icon size={16} strokeWidth={1.5} /> {c.label}
                </div>
                {category === c.key && c.subs?.map(s => (
                  <div key={s} onClick={() => setSubcategory(s)}
                    style={{ padding: '6px 0 6px 32px', cursor: 'pointer', fontSize: 13, color: subcategory === s ? '#2563eb' : '#64748b' }}>
                    • {s}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Products Grid */}
        <div style={{ flex: 1 }}>
          <p style={{ marginBottom: 16, fontWeight: 600 }}>
            {currentCat?.label || '전체'} 상품 <span style={{ background: '#2563eb', color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 13 }}>{products.length}개</span>
          </p>
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>상품이 없습니다.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {products.map(p => (
                <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ background: '#1e293b', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>F</div>
                  <div style={{ padding: 16 }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#2563eb', fontWeight: 700 }}>{p.price.toLocaleString()}원</span>
                      <button onClick={() => navigate(`/order/${p.id}`)}
                        style={{ padding: '6px 14px', border: '1px solid #e5e7eb', borderRadius: 20, background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                        구매하기 &gt;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
