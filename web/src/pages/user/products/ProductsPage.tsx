import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutGrid,
  Tv2,
  Gamepad2,
  BookOpen,
  Gift,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { productsApi } from "../../../api";
import type { Product } from "../../../types";
import EmptyState from "../../../components/ui/EmptyState";
import bannerBroadcast from "../../../assets/img/banner-broadcast.png";
import bannerGame from "../../../assets/img/banner-game.png";
import bannerWebtoon from "../../../assets/img/banner-webtoon.png";
import bannerGiftcard from "../../../assets/img/banner-giftcard.png";
import productSample from "../../../assets/img/product-sample.png";

type Category = {
  key: string | null;
  label: string;
  desc: string;
  Icon: LucideIcon;
  banner: string;
  subs?: string[];
};

const categories: Category[] = [
  {
    key: null,
    label: "전체상품",
    desc: "다양한 상품을 확인해보세요",
    Icon: LayoutGrid,
    banner: bannerBroadcast,
  },
  {
    key: "broadcast",
    label: "방송",
    desc: "다양한 방송 플랫폼 관련 상품을 확인해보세요",
    Icon: Tv2,
    banner: bannerBroadcast,
    subs: ["플렉스티비", "SOOP", "투네이션", "팝콘티비", "팬더"],
  },
  {
    key: "game",
    label: "게임",
    desc: "다양한 게임 플랫폼 관련 상품을 확인해보세요",
    Icon: Gamepad2,
    banner: bannerGame,
  },
  {
    key: "webtoon",
    label: "웹툰",
    desc: "다양한 웹툰 플랫폼 관련 상품을 확인해보세요",
    Icon: BookOpen,
    banner: bannerWebtoon,
  },
  {
    key: "giftcard",
    label: "상품권",
    desc: "다양한 상품권 관련 상품을 확인해보세요",
    Icon: Gift,
    banner: bannerGiftcard,
  },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(
    params.get("category") || null,
  );
  const [subcategory, setSubcategory] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({
        category: category ?? undefined,
        subcategory: subcategory ?? undefined,
      })
      .then((r) => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, subcategory]);

  const currentCat = categories.find((c) => c.key === category) ?? categories[0];
  const listTitle = subcategory ?? currentCat.label;

  return (
    <div>
      {/* Top banner (full-bleed) */}
      <section className="w-full bg-hero">
        <div className="mx-auto flex h-[370px] max-w-[1200px] items-center justify-between px-6">
          <div className="flex flex-col">
            {/* Breadcrumb inside banner */}
            <nav className="flex items-center gap-1 text-[14px] tracking-[-0.5px]">
              <span className="text-ink/40">홈</span>
              <ChevronRight className="size-3.5 text-ink/40" strokeWidth={2} />
              <span className="text-ink/60">상품목록</span>
            </nav>
            <h1 className="mt-10 text-[48px] font-bold leading-none tracking-[-0.5px] text-ink">
              {currentCat.label}
            </h1>
            <p className="mt-2 text-[16px] leading-[26px] tracking-[-0.5px] text-ink/50">
              {currentCat.desc}
            </p>
          </div>
          <img
            src={currentCat.banner}
            alt=""
            className="h-[184px] w-auto shrink-0 object-contain"
          />
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto flex max-w-[1200px] items-start gap-[30px] px-6 pb-32 pt-20">
        {/* Sidebar */}
        <aside className="w-[278px] shrink-0 overflow-hidden rounded-2xl border border-line bg-white">
          <p className="px-6 pb-4 pt-[22px] text-[16px] font-semibold tracking-[-0.5px] text-ink">
            카테고리
          </p>
          <div className="flex flex-col gap-0.5 px-3 pb-4">
            {categories.map((c) => {
              const active = category === c.key;
              return (
                <div key={c.label}>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(c.key);
                      setSubcategory(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-[10px] p-3 text-left ${
                      active ? "bg-primary-soft" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <c.Icon
                        size={16}
                        strokeWidth={1.8}
                        className={active ? "text-primary" : "text-ink"}
                      />
                      <span
                        className={`text-[15px] font-semibold tracking-[-0.5px] ${
                          active ? "text-primary" : "text-ink"
                        }`}
                      >
                        {c.label}
                      </span>
                    </span>
                    {c.subs && (
                      <ChevronDown
                        size={16}
                        strokeWidth={2}
                        className={`text-ink/40 transition-transform ${
                          active ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {active &&
                    c.subs?.map((s) => {
                      const subActive = subcategory === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSubcategory(s)}
                          className="flex w-full items-center gap-2.5 rounded-lg py-2.5 pl-8 pr-3 text-left"
                        >
                          <span
                            className={`size-[5px] shrink-0 rounded-full ${
                              subActive ? "bg-primary" : "bg-ink/30"
                            }`}
                          />
                          <span
                            className={`text-[14px] font-medium tracking-[-0.5px] ${
                              subActive ? "text-primary" : "text-ink/70"
                            }`}
                          >
                            {s}
                          </span>
                        </button>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Product list */}
        <div className="min-w-0 flex-1">
          {/* Count title */}
          <div className="flex items-center gap-2 pb-7">
            <p className="text-[16px] font-semibold tracking-[-0.5px] text-ink">
              {listTitle} 상품
            </p>
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium tracking-[-0.5px] text-white">
              총 {products.length}개
            </span>
          </div>

          {loading ? (
            <div className="py-24 text-center text-ink/40">불러오는 중...</div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<AlertCircle />}
              title="해당 서비스는 오픈 준비 중입니다."
              description="이용에 불편을 드려 죄송합니다."
            />
          ) : (
            <>
              {/* Purchase-input row (visual only) */}
              <div className="mb-5 flex items-center justify-center gap-[70px] rounded-xl border border-line bg-[#f0f0f0] py-3.5">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="수량 입력"
                      className="w-[180px] rounded-lg border border-line bg-white px-3.5 py-3 text-[13px] text-ink placeholder:text-[#adadad] focus:outline-none"
                    />
                    <span className="text-[15px] font-semibold tracking-[-0.5px] text-ink">
                      개
                    </span>
                  </div>
                  <span className="text-[18px] text-ink">/</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="금액"
                      className="w-[180px] rounded-lg border border-line bg-white px-3.5 py-3 text-[13px] text-ink placeholder:text-[#adadad] focus:outline-none"
                    />
                    <span className="text-[15px] font-semibold tracking-[-0.5px] text-ink">
                      원
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/order/${products[0].id}`)}
                  className="cursor-pointer rounded-full bg-primary px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-white"
                >
                  구매하기
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-3 gap-3.5">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white"
                  >
                    <img
                      src={productSample}
                      alt={p.name}
                      className="h-[200px] w-full object-cover"
                    />
                    <div className="flex flex-col px-[22px] py-[26px]">
                      <p className="text-[16px] font-medium tracking-[-0.5px] text-ink">
                        {p.name}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[18px] font-bold tracking-[-0.5px] text-primary">
                          {p.price.toLocaleString()}원
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/order/${p.id}`)}
                          className="flex cursor-pointer items-center gap-0.5 rounded-full border border-primary py-1.5 pl-3.5 pr-2.5 text-[12px] font-medium text-primary"
                        >
                          구매하기
                          <ChevronRight size={10} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
