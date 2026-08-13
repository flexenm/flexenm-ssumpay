import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, Lock, PenLine } from "lucide-react";
import { changePassword as changePasswordApi } from "@/api/mypage";
import { useFetchMypage } from "@/hooks/useMypage";
import { useFetchMyOrders } from "@/hooks/useOrders";
import { useFetchInquiries } from "@/hooks/useInquiries";
import { getApiError } from "@/utils/error";
import SegmentedTabs from "@/components/ui/SegmentedTabs";
import Pagination from "@/components/ui/Pagination";

const tabItems = [
  { key: "0", label: "내 정보" },
  { key: "1", label: "구매 내역" },
  { key: "2", label: "1:1 문의 내역" },
];
const breadcrumbs = ["내정보", "구매내역", "1:1문의내역"];
const PAGE_SIZE = 10;

export default function MyPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(() => {
    const t = Number(searchParams.get("tab"));
    return t >= 0 && t <= 2 ? t : 0;
  });
  const [orderPage, setOrderPage] = useState(1);
  const [inquiryPage, setInquiryPage] = useState(1);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const navigate = useNavigate();

  const { mypage } = useFetchMypage();
  // 탭이 활성일 때만 조회한다. 탭을 떠났다 돌아오면 캐시가 즉시 채워주고 뒤에서 갱신된다.
  const { myOrders, isLoading: ordersLoading } = useFetchMyOrders({
    enabled: tab === 1,
  });
  const { inquiries, isLoading: inquiriesLoading } = useFetchInquiries({
    enabled: tab === 2,
  });
  const loading = ordersLoading || inquiriesLoading;

  // 탭을 옮기면 목록 페이지를 처음으로 되돌린다
  const changeTab = (next: number) => {
    setTab(next);
    setOrderPage(1);
    setInquiryPage(1);
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (pwForm.newPassword !== pwForm.newPasswordConfirm) {
      setPwError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      await changePasswordApi({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess("비밀번호가 변경되었습니다.");
      setPwForm({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
    } catch (err) {
      const { message } = getApiError(err);
      setPwError(message ?? "비밀번호 변경에 실패했습니다.");
    }
  };

  const infoRows: [string, string][] = mypage
    ? [
        ["아이디", mypage.username],
        ["이메일", mypage.email],
      ]
    : [];
  const pwFields: [keyof typeof pwForm, string, string][] = [
    ["currentPassword", "현재 비밀번호", "현재 비밀번호 입력"],
    ["newPassword", "새 비밀번호", "8자 이상, 영문+숫자+특수문자"],
    ["newPasswordConfirm", "새 비밀번호 확인", "재입력"],
  ];

  const orderTotalPages = Math.ceil(myOrders.length / PAGE_SIZE);
  const pagedOrders = myOrders.slice(
    (orderPage - 1) * PAGE_SIZE,
    orderPage * PAGE_SIZE,
  );
  const inquiryTotalPages = Math.ceil(inquiries.length / PAGE_SIZE);
  const pagedInquiries = inquiries.slice(
    (inquiryPage - 1) * PAGE_SIZE,
    inquiryPage * PAGE_SIZE,
  );

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-12">
      {/* Header */}
      <div className="mb-12 border-b border-line pb-8 text-center">
        <p className="mb-4 text-[13px] text-ink/50">
          홈 &gt; 마이페이지 &gt; {breadcrumbs[tab]}
        </p>
        <h1 className="mb-3 text-[48px] font-bold text-ink">마이페이지</h1>
        <p className="text-[15px] text-ink/50">
          회원 정보를 관리하고 다양한 서비스를 이용해보세요
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-14 flex justify-center">
        <SegmentedTabs
          tabs={tabItems}
          value={String(tab)}
          onChange={(k) => changeTab(Number(k))}
        />
      </div>

      <div className="mx-auto max-w-[730px]">
        {/* 내 정보 */}
        {tab === 0 && mypage && (
          <div>
            {/* 회원 정보 */}
            <h2 className="mb-6 border-b-2 border-navy-rule pb-4 text-[18px] font-bold text-ink">
              회원 정보
            </h2>
            <div className="mb-12">
              {infoRows.map(([label, value]) => (
                <div key={label} className="flex items-center gap-4 py-2.5">
                  <span className="w-[100px] shrink-0 text-[15px] font-medium text-ink">
                    {label}
                  </span>
                  <div className="flex-1 rounded-lg bg-field px-[18px] py-[14px] text-[15px] text-ink">
                    {value}
                  </div>
                  <div className="flex w-[64px] shrink-0 items-center gap-1 whitespace-nowrap text-[13px] text-ink/50">
                    <Lock size={13} /> 변경 불가
                  </div>
                </div>
              ))}
              <p className="mt-3 text-[13px] text-ink/50">
                ※ 아이디·이메일은 변경할 수 없습니다.
              </p>
            </div>

            {/* 비밀번호 변경 */}
            <h2 className="mb-6 border-b-2 border-navy-rule pb-4 text-[18px] font-bold text-ink">
              비밀번호 변경
            </h2>
            <form onSubmit={changePassword}>
              {pwFields.map(([key, label, placeholder]) => (
                <div key={key} className="flex items-center gap-4 py-2.5">
                  <span className="w-[100px] shrink-0 text-[15px] font-medium text-ink">
                    {label}
                  </span>
                  <input
                    type="password"
                    value={pwForm[key]}
                    onChange={(e) =>
                      setPwForm((p) => ({ ...p, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className="flex-1 rounded-lg bg-field px-[18px] py-[14px] text-[15px] text-ink placeholder:text-ink/40 outline-none"
                  />
                </div>
              ))}
              {pwError && (
                <p className="mt-2 text-[13px] text-red-500">{pwError}</p>
              )}
              {pwSuccess && (
                <p className="mt-2 text-[13px] text-green-600">{pwSuccess}</p>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-navy px-8 py-3 text-[15px] font-semibold text-white"
                >
                  비밀번호 변경
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 구매 내역 */}
        {tab === 1 && (
          <div>
            {loading ? (
              <p className="py-16 text-center text-[15px] text-ink/50">
                불러오는 중...
              </p>
            ) : myOrders.length === 0 ? (
              <p className="py-16 text-center text-[15px] text-ink/50">
                구매 내역이 없습니다.
              </p>
            ) : (
              <>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-y border-line bg-page">
                      {["주문 일시", "주문번호", "상품", "금액", "상태"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-4 text-center text-[14px] font-semibold text-ink"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.map((o) => (
                      <tr key={o.id} className="border-b border-line">
                        <td className={tdClass}>{formatDate(o.createdAt)}</td>
                        <td className={tdClass}>{o.orderNo}</td>
                        <td className={tdClass}>{o.productName}</td>
                        <td className={tdClass}>
                          {o.price?.toLocaleString()}원
                        </td>
                        <td className={tdClass}>
                          <span
                            className={`inline-block rounded-full px-3.5 py-[5px] text-[13px] font-semibold ${
                              o.chargeStatus === 1
                                ? "bg-primary text-white"
                                : "bg-field text-ink/50"
                            }`}
                          >
                            {o.chargeStatus === 1 ? "충전 완료" : "충전 대기"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  page={orderPage}
                  totalPages={orderTotalPages}
                  onChange={setOrderPage}
                />
              </>
            )}
          </div>
        )}

        {/* 1:1 문의 내역 */}
        {tab === 2 && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => navigate("/cs/inquiries/new")}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-navy px-5 py-[10px] text-[14px] font-medium text-white"
              >
                <PenLine size={15} /> 문의하기
              </button>
            </div>
            {loading ? (
              <p className="py-16 text-center text-[15px] text-ink/50">
                불러오는 중...
              </p>
            ) : inquiries.length === 0 ? (
              <p className="py-16 text-center text-[15px] text-ink/50">
                문의 내역이 없습니다.
              </p>
            ) : (
              <>
                {pagedInquiries.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => navigate(`/mypage/inquiries/${q.id}`)}
                    className="flex cursor-pointer items-center justify-between border-b border-line py-[18px]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-semibold ${
                          q.status === 1
                            ? "bg-primary text-white"
                            : "bg-field text-ink/50"
                        }`}
                      >
                        {q.status === 1 ? "답변 완료" : "답변 대기"}
                      </span>
                      <span className="text-[15px] font-medium text-ink">
                        {q.title}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-[13px] text-ink/50">
                      {formatDate(q.createdAt)}
                      <ChevronRight size={16} className="text-ink/40" />
                    </div>
                  </div>
                ))}
                <Pagination
                  page={inquiryPage}
                  totalPages={inquiryTotalPages}
                  onChange={setInquiryPage}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const tdClass = "px-4 py-4 text-center text-[14px] text-ink";

const formatDate = (value: string) => {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};
