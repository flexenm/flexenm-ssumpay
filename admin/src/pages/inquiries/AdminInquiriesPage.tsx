import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetchInquiries } from "@/hooks/useInquiries";
import { INQUIRY_STATUS } from "@/types";

const typeLabel: Record<number, string> = {
  1: "충전",
  2: "결제",
  3: "취소·환불",
  4: "기타",
};

const fmtDateTime = (s: string) => {
  const d = new Date(s);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

const TH = "px-5 h-[52px] text-left text-[14px] font-medium text-admin-muted";
const TD = "px-5 py-4 text-[14px] text-ink";

export default function AdminInquiriesPage() {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  // 유형·상태는 백엔드 파라미터(server/routes/admin/inquiries.js)로 조회한다.
  const { inquiries, isLoading: loading } = useFetchInquiries({ status, type });

  const search = () => setAppliedKeyword(keyword);

  // 아이디 검색은 백엔드 미지원이라 클라이언트 측에서 필터한다.
  const filtered = appliedKeyword
    ? inquiries.filter((q) =>
        (q.member?.username ?? "").includes(appliedKeyword),
      )
    : inquiries;

  return (
    <div>
      <h1 className="mb-8 text-[24px] font-bold text-admin">1:1 문의 관리</h1>

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-[52px] w-[200px] rounded-lg border border-admin-border bg-admin-bg px-4 text-[15px] text-ink outline-none"
        >
          <option value="">유형: 전체</option>
          <option value="1">유형: 충전</option>
          <option value="2">유형: 결제</option>
          <option value="3">유형: 취소·환불</option>
          <option value="4">유형: 기타</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-[52px] w-[200px] rounded-lg border border-admin-border bg-admin-bg px-4 text-[15px] text-ink outline-none"
        >
          <option value="">상태: 전체</option>
          <option value="0">상태: 답변 대기</option>
          <option value="1">상태: 답변 완료</option>
        </select>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="아이디"
          className="h-[52px] w-[360px] max-w-full rounded-lg border border-admin-border bg-admin-bg px-4 text-[15px] text-ink outline-none placeholder:text-[#a6a6a6]"
        />
        <button
          onClick={search}
          className="h-[52px] w-[110px] rounded-lg bg-admin text-[15px] font-medium text-white"
        >
          검색
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-admin-head">
              <th className={`${TH} w-[90px]`}>번호</th>
              <th className={`${TH} w-[140px]`}>유형</th>
              <th className={TH}>제목</th>
              <th className={`${TH} w-[180px]`}>아이디</th>
              <th className={`${TH} w-[220px]`}>등록일</th>
              <th className={`${TH} w-[140px]`}>상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-[14px] text-admin-muted"
                >
                  불러오는 중...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-[14px] text-admin-muted"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((q) => {
                const answered = q.status === INQUIRY_STATUS.ANSWERED;
                return (
                  <tr
                    key={q.id}
                    onClick={() => navigate(`/inquiries/${q.id}`)}
                    className="cursor-pointer border-b border-admin-line hover:bg-admin-bg"
                  >
                    <td className={TD}>{q.id}</td>
                    <td className={TD}>{typeLabel[q.type] ?? q.type}</td>
                    <td className={TD}>{q.title}</td>
                    <td className={TD}>{q.member?.username || "-"}</td>
                    <td className={TD}>{fmtDateTime(q.createdAt)}</td>
                    <td
                      className={`${TD} ${answered ? "text-admin-muted" : "font-semibold text-admin"}`}
                    >
                      {answered ? "답변 완료" : "답변 대기"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-[14px] text-admin-muted">
        ※ 행 클릭 시 답변 화면으로 이동 · 답변 대기 건은 굵게/강조 표시
      </p>
    </div>
  );
}
