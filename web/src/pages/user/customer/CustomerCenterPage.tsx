import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, ChevronRight, PenLine, Info, AlertCircle } from "lucide-react";
import { noticesApi, inquiriesApi } from "@/api";
import type { Notice, Inquiry } from "@/types";
import { getAccessToken } from "@/utils/cookie";
import SegmentedTabs from "@/components/ui/SegmentedTabs";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";

const PER_PAGE = 10;

const fmtDate = (s: string) => {
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

const fmtDateTime = (s: string) => {
  const d = new Date(s);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export default function CustomerCenterPage() {
  const [tab, setTab] = useState(0);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [noticePage, setNoticePage] = useState(1);
  const [inquiryPage, setInquiryPage] = useState(1);
  const isLoggedIn = !!getAccessToken();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    noticesApi
      .list()
      .then((r) => setNotices(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
    if (isLoggedIn)
      inquiriesApi
        .list()
        .then((r) => setInquiries(r.items))
        .catch(() => {});
  }, []);

  const noticeTotalPages = Math.ceil(notices.length / PER_PAGE);
  const pagedNotices = notices.slice(
    (noticePage - 1) * PER_PAGE,
    noticePage * PER_PAGE,
  );
  const inquiryTotalPages = Math.ceil(inquiries.length / PER_PAGE);
  const pagedInquiries = inquiries.slice(
    (inquiryPage - 1) * PER_PAGE,
    inquiryPage * PER_PAGE,
  );

  return (
    <div className="mx-auto max-w-[900px] px-6 py-14">
      <p className="mb-3 text-center text-[14px] text-ink/40">
        홈 &gt; 고객센터 &gt;{" "}
        <span className="text-ink/60">{tab === 0 ? "공지사항" : "1:1문의"}</span>
      </p>
      <h1 className="mb-3 text-center text-[48px] font-bold text-ink">
        고객센터
      </h1>
      <p className="text-center text-[15px] text-ink/40">
        공지사항을 확인하고 궁금한 점은 언제든 문의해보세요
      </p>

      <hr className="my-10 border-t border-line" />

      <div className="mb-10 flex justify-center">
        <SegmentedTabs
          tabs={[
            { key: "notice", label: "공지사항" },
            { key: "inquiry", label: "1:1 문의" },
          ]}
          value={tab === 0 ? "notice" : "inquiry"}
          onChange={(k) => setTab(k === "notice" ? 0 : 1)}
        />
      </div>

      {tab === 0 &&
        (loading ? (
          <div className="rounded-[26px] bg-page p-20 text-center text-ink/40">
            불러오는 중...
          </div>
        ) : notices.length === 0 ? (
          <EmptyState
            icon={<AlertCircle />}
            title="등록된 공지사항이 없습니다."
          />
        ) : (
          <>
            {pagedNotices.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => navigate(`/customer/notices/${n.id}`)}
                className="flex w-full cursor-pointer items-center justify-between border-b border-line px-5 py-7 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                    <Bookmark size={14} className="text-primary" />
                  </span>
                  <span
                    className={`text-[15px] text-ink ${n.isPinned ? "font-bold" : "font-normal"}`}
                  >
                    {n.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[13px] text-ink/40">
                  {fmtDate(n.createdAt)}
                  <ChevronRight size={16} className="text-ink/40" />
                </div>
              </button>
            ))}
            <Pagination
              page={noticePage}
              totalPages={noticeTotalPages}
              onChange={setNoticePage}
            />
          </>
        ))}

      {tab === 1 && (
        <div>
          {isLoggedIn && (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/customer/inquiries/new")}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-[14px] font-medium text-white"
              >
                <PenLine size={15} /> 문의하기
              </button>
            </div>
          )}
          {pagedInquiries.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => navigate(`/mypage/inquiries/${q.id}`)}
              className="flex w-full cursor-pointer items-center justify-between border-b border-line px-5 py-7 text-left"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-[13px] font-medium ${q.status === 1 ? "bg-primary text-white" : "bg-ink/10 text-ink/50"}`}
                >
                  {q.status === 1 ? "답변 완료" : "답변 대기"}
                </span>
                <span className="text-[15px] text-ink">{q.title}</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-ink/40">
                {fmtDateTime(q.createdAt)}
                <ChevronRight size={16} className="text-ink/40" />
              </div>
            </button>
          ))}
          {inquiries.length > 0 && (
            <Pagination
              page={inquiryPage}
              totalPages={inquiryTotalPages}
              onChange={setInquiryPage}
            />
          )}
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-page px-6 py-5">
            <Info size={18} className="shrink-0 text-ink/50" />
            <p className="text-[14px] text-ink/70">
              1:1 문의는 로그인 후 이용할 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
