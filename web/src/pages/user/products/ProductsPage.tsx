import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LayoutGrid, Tv2, Gamepad2, BookOpen, Gift } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { productsApi } from '../../../api'
import type { Product } from '../../../types'

const categories: { key: string | null; label: string; Icon: LucideIcon; subs?: string[] }[] = [
  { key: null, label: '전체상품', Icon: LayoutGrid },
  { key: 'broadcast', label: '방송', Icon: Tv2, subs: ['플렉스', 'SOOP', '투네이션', '팝콘티비', '랜더'] },
  { key: 'game', label: '게임', Icon: Gamepad2 },
  { key: 'webtoon', label: '웹툰', Icon: BookOpen },
  { key: 'giftcard', label: '상품권', Icon: Gift },
]

export default function ProductsPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string | null>(params.get('category') || null)
  const [subcategory, setSubcategory] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    productsApi.list({ category: category ?? undefined, subcategory: subcategory ?? undefined })
      .then(r => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [category, subcategory])

  const currentCat = categories.find(c => c.key === category)

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      {/* Breadcrumb */}
      <p className="mb-4 text-[13px] text-slate-400">홈 &gt; 상품목록</p>

      {/* Category Header */}
      <div className="mb-8 flex items-center justify-between rounded-2xl bg-[linear-gradient(135deg,#dbeafe,#eff6ff)] px-10 py-8">
        <div>
          <h1 className="text-[36px] font-bold">{currentCat?.label || '전체상품'}</h1>
          <p className="mt-2 text-slate-500">다양한 {currentCat?.label || ''} 플랫폼 관련 상품을 확인보세요</p>
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[rgba(255,255,255,0.6)]">
          {currentCat?.Icon
            ? <currentCat.Icon size={48} color="#2563eb" strokeWidth={1.5} />
            : <LayoutGrid size={48} color="#2563eb" strokeWidth={1.5} />}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-[200px] shrink-0">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 font-bold">카테고리</p>
            {categories.map(c => (
              <div key={c.key}>
                <div onClick={() => { setCategory(c.key); setSubcategory(null) }}
                  className={`flex cursor-pointer items-center gap-2 py-2 ${category === c.key ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                  <c.Icon size={16} strokeWidth={1.5} /> {c.label}
                </div>
                {category === c.key && c.subs?.map(s => (
                  <div key={s} onClick={() => setSubcategory(s)}
                    className={`cursor-pointer py-1.5 pl-8 text-[13px] ${subcategory === s ? 'text-blue-600' : 'text-slate-500'}`}>
                    • {s}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <p className="mb-4 font-semibold">
            {currentCat?.label || '전체'} 상품 <span className="rounded-xl bg-blue-600 px-2.5 py-0.5 text-[13px] text-white">{products.length}개</span>
          </p>
          {loading ? (
            <div className="p-20 text-center text-slate-400">불러오는 중...</div>
          ) : products.length === 0 ? (
            <div className="p-20 text-center text-slate-400">상품이 없습니다.</div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {products.map(p => (
                <div key={p.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="flex h-40 items-center justify-center bg-slate-800 text-5xl">F</div>
                  <div className="p-4">
                    <p className="mb-1 font-semibold">{p.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-600">{p.price.toLocaleString()}원</span>
                      <button onClick={() => navigate(`/order/${p.id}`)}
                        className="cursor-pointer rounded-[20px] border border-gray-200 bg-white px-3.5 py-1.5 text-[13px]">
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
