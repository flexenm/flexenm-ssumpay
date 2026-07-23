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
      <div className="flex max-w-full items-center justify-between bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_100%)] px-10 py-20">
        <div>
          <h1 className="text-[40px] font-bold leading-[1.3] text-slate-800">
            <span className="text-blue-600">간편</span>하고 <span className="text-blue-600">안전한 결제,</span><br />
            썸페이와 함께하세요
          </h1>
          <p className="mt-4 text-base text-slate-500">방송, 게임, 웹툰, 상품권까지<br />모든 결제를 썸페이에서 한번에 해결할 수 있어요</p>
        </div>
        <div className="text-[80px]">💰</div>
      </div>

      {/* Categories */}
      <div className="mx-auto my-[60px] max-w-[1100px] px-10">
        <h2 className="mb-2 text-center text-[28px] font-bold">원하는 서비스를</h2>
        <p className="mb-2 text-center text-2xl font-bold text-blue-600">빠르고 안전하게 결제하세요</p>
        <p className="mb-12 text-center text-slate-400">방송, 게임, 웹툰, 상품권까지 모두 한번에!</p>
        <div className="grid grid-cols-4 gap-6">
          {categories.map(c => (
            <div key={c.key} onClick={() => navigate(`/products?category=${c.key}`)}
              className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-8 text-center transition-shadow duration-200"
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
              <div className="mb-4 flex justify-center">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#dbeafe,#eff6ff)]">
                  <c.Icon size={36} color="#2563eb" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold">{c.label}</h3>
              <p className="mb-5 text-[13px] text-slate-400">{c.desc}</p>
              <button className="cursor-pointer rounded-[20px] border border-blue-600 bg-none px-4 py-1.5 text-[13px] text-blue-600">
                상품 보러가기 &gt;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
