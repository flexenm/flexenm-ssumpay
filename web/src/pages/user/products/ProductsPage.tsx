import { useNavigate, useParams, Navigate, Link } from "react-router-dom";
import { ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { useProducts } from "../../../hooks/useProducts";
import {
  productCategories,
  resolveCategory,
  resolveSub,
} from "../../../config/productCategories";
import EmptyState from "../../../components/ui/EmptyState";
import productSample from "../../../assets/img/product-sample.png";

export default function ProductsPage() {
  const navigate = useNavigate();
  // URL 이 곧 상태다. /products/:category/:sub
  const { category: categorySlug, sub: subSlug } = useParams<{
    category?: string;
    sub?: string;
  }>();

  const currentCat = resolveCategory(categorySlug);
  // 잘못된 카테고리 slug → 전체상품으로 리다이렉트
  if (!currentCat) return <Navigate to="/products" replace />;

  const currentSub = resolveSub(currentCat, subSlug);
  // 카테고리엔 있으나 잘못된 하위 slug → 카테고리 목록으로 리다이렉트
  if (subSlug && !currentSub) {
    return <Navigate to={`/products/${currentCat.slug}`} replace />;
  }

  const {
    data: products = [],
    isLoading,
    isError,
  } = useProducts({
    category: currentCat.category ?? undefined,
    subcategory: currentSub?.subcategory,
  });

  const listTitle = currentSub?.label ?? currentCat.label;

  return (
    <div>
      {/* Top banner (full-bleed) */}
      <section className="w-full bg-hero">
        <div className="mx-auto flex h-[370px] max-w-[1200px] items-center justify-between px-6">
          <div className="flex flex-col">
            {/* Breadcrumb — 설정에서 파생 */}
            <nav className="flex items-center gap-1 text-[14px] tracking-[-0.5px]">
              <Link to="/" className="text-ink/40 hover:text-ink/60">
                홈
              </Link>
              <ChevronRight className="size-3.5 text-ink/40" strokeWidth={2} />
              <Link
                to="/products"
                className={
                  currentCat.slug ? "text-ink/40 hover:text-ink/60" : "text-ink/60"
                }
              >
                전체상품
              </Link>
              {currentCat.slug && (
                <>
                  <ChevronRight
                    className="size-3.5 text-ink/40"
                    strokeWidth={2}
                  />
                  <Link
                    to={`/products/${currentCat.slug}`}
                    className={
                      currentSub
                        ? "text-ink/40 hover:text-ink/60"
                        : "text-ink/60"
                    }
                  >
                    {currentCat.label}
                  </Link>
                </>
              )}
              {currentSub && (
                <>
                  <ChevronRight
                    className="size-3.5 text-ink/40"
                    strokeWidth={2}
                  />
                  <span className="text-ink/60">{currentSub.label}</span>
                </>
              )}
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
            {productCategories.map((c) => {
              const active = c.slug === currentCat.slug;
              return (
                <div key={c.label}>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(c.slug ? `/products/${c.slug}` : "/products")
                    }
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
                    {c.subs.length > 0 && (
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
                    c.subs.map((s) => {
                      const subActive = s.slug === currentSub?.slug;
                      return (
                        <button
                          key={s.slug}
                          type="button"
                          onClick={() =>
                            navigate(`/products/${c.slug}/${s.slug}`)
                          }
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
                            {s.label}
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

          {isLoading ? (
            <div className="py-24 text-center text-ink/40">불러오는 중...</div>
          ) : isError || products.length === 0 ? (
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
