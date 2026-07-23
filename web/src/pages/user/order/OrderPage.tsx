import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, Mail } from "lucide-react";
import { ordersApi } from "@/api";
import { useProduct } from "@/hooks/useProducts";
import type { PaymentMethod } from "@/types";

interface OrderForm {
  flexUsername: string;
  flexPassword: string;
  paymentMethod: PaymentMethod;
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; Icon: typeof CreditCard }[] = [
  { value: 1, label: "신용카드", Icon: CreditCard },
  { value: 2, label: "무통장", Icon: Mail },
];

export default function OrderPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data: product, isError } = useProduct(productId);
  const [form, setForm] = useState<OrderForm>({
    flexUsername: "",
    flexPassword: "",
    paymentMethod: 1,
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  // 없는 상품 등 조회 실패 → 목록으로
  useEffect(() => {
    if (isError) navigate("/products");
  }, [isError, navigate]);

  const submit = async () => {
    if (!form.flexUsername) {
      setError("플렉스티비 아이디를 입력해주세요.");
      return;
    }
    if (!form.flexPassword) {
      setError("플렉스티비 비밀번호를 입력해주세요.");
      return;
    }
    if (!agreed) {
      setError("이용약관에 동의해주세요.");
      return;
    }
    setError("");
    try {
      const res = await ordersApi.create({
        productId: Number(productId),
        flexUsername: form.flexUsername,
        flexPassword: form.flexPassword,
        paymentMethod: form.paymentMethod,
      });
      navigate(`/order/complete/${res.data.orderNo}`);
    } catch (err) {
      setError((err as { message?: string })?.message || "주문에 실패했습니다.");
    }
  };

  if (!product) return <div className="py-20 text-center">로딩중...</div>;

  return (
    <div>
      {/* 타이틀 배너 */}
      <div className="border-b border-line py-16 text-center">
        <p className="mb-3 text-[14px] text-ink/40">홈 &gt; 상품목록 &gt; 주문/결제</p>
        <h1 className="text-[48px] font-bold text-ink">주문/결제</h1>
        <p className="mt-3 text-[15px] text-ink/50">
          안전한 결제를 위해 주문 정보를 확인해주세요
        </p>
      </div>

      <div className="mx-auto max-w-[800px] px-6 py-14">
        {/* 주문 상품 */}
        <Section num={1} title="주문 상품">
          <div className="flex items-center justify-between rounded-2xl bg-primary-soft px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-navy text-2xl font-bold text-white">
                {product.name.charAt(0)}
              </div>
              <div>
                <p className="text-[17px] font-bold text-ink">{product.name}</p>
                <p className="mt-0.5 text-[14px] text-ink/50">수량: 1개</p>
              </div>
            </div>
            <span className="text-[20px] font-bold text-primary">
              {product.price.toLocaleString()}원
            </span>
          </div>
        </Section>

        {/* 충전 계정 */}
        <Section num={2} title="충전 계정 정보">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>플렉스티비 아이디 *</label>
              <input
                value={form.flexUsername}
                onChange={(e) => setForm((p) => ({ ...p, flexUsername: e.target.value }))}
                placeholder="충전할 플렉스티비 아이디 입력"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>플렉스티비 비밀번호 *</label>
              <input
                type="password"
                value={form.flexPassword}
                onChange={(e) => setForm((p) => ({ ...p, flexPassword: e.target.value }))}
                placeholder="충전할 플렉스티비 비밀번호 입력"
                className={inputClass}
              />
            </div>
          </div>
          <p className="mt-3 text-[13px] text-ink/40">
            ※ 입력한 아이디로 충전이 진행됩니다. 오입력 시 복구/환불이 어려우니 다시 확인해 주세요.
          </p>
        </Section>

        {/* 결제 수단 */}
        <Section num={3} title="결제 수단">
          <div className="grid grid-cols-2 gap-4">
            {PAYMENT_OPTIONS.map((m) => {
              const selected = form.paymentMethod === m.value;
              return (
                <div
                  key={m.value}
                  onClick={() => setForm((p) => ({ ...p, paymentMethod: m.value }))}
                  className={`relative cursor-pointer rounded-2xl p-6 text-center transition-colors ${
                    selected
                      ? "border-2 border-primary bg-primary-soft"
                      : "border-2 border-transparent bg-field"
                  }`}
                >
                  {selected && (
                    <span className="absolute right-3 top-3 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M2 5l2 2 4-4"
                          stroke="#fff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                  <div className="mb-2 flex justify-center">
                    <m.Icon
                      size={28}
                      color={selected ? "#1e59e8" : "#9ca3af"}
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className={selected ? "text-primary" : "text-ink/60"}>{m.label}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* 최종 금액 */}
        <div className="mb-5 flex items-center justify-between rounded-2xl bg-primary px-6 py-5 text-white">
          <span className="text-[16px] font-semibold">최종 결제 금액</span>
          <span className="text-[26px] font-bold">{product.price.toLocaleString()}원</span>
        </div>

        <div className="mb-8 flex items-center gap-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            id="agree"
          />
          <label htmlFor="agree" className="text-[14px] text-ink/70">
            주문 내용을 확인하였으며, <span className="text-primary">이용약관</span> 및{" "}
            <span className="text-primary">개인정보처리방침</span>에 동의합니다.
          </label>
        </div>

        {error && <p className="mb-3 text-center text-[13px] text-red-500">{error}</p>}

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={submit}
            className="cursor-pointer rounded-lg border-none bg-navy px-10 py-3 text-[15px] font-bold text-white"
          >
            {product.price.toLocaleString()}원 결제하기
          </button>
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer border-none bg-transparent text-[14px] text-ink/40 underline"
          >
            상품 목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ num, title, children }: { num: number; title: string; children: ReactNode }) {
  return (
    <div className="mb-12">
      <h2 className="mb-3 flex items-center gap-2 border-b-2 border-navy-rule pb-3 text-[18px] font-bold text-ink">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[13px] text-white">
          {num}
        </span>
        {title}
      </h2>
      <div className="pt-5">{children}</div>
    </div>
  );
}

const labelClass = "mb-2 block text-[14px] font-semibold text-ink";
const inputClass =
  "w-full rounded-lg bg-field px-[18px] py-[14px] text-[15px] text-ink placeholder:text-ink/40 outline-none";
