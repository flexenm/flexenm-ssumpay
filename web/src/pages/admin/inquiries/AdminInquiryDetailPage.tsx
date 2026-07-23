import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminInquiriesApi } from "../../../api";
import { INQUIRY_STATUS } from "../../../types";
import type { Inquiry, Member } from "../../../types";

interface AdminInquiry extends Inquiry {
  member?: Member;
}

const typeLabel: Record<number, string> = {
  1: "충전",
  2: "결제",
  3: "취소·환불",
  4: "기타",
};

const fmtDateTime = (s: string) => {
  const d = new Date(s);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function AdminInquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<AdminInquiry | null>(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    adminInquiriesApi
      .get(id!)
      .then((r) => {
        setInquiry(r.data);
        setAnswer(r.data.answer || "");
      })
      .catch(() => navigate("/admin/inquiries"));
  }, [id]);

  const submit = async () => {
    if (!answer) return alert("답변을 입력해주세요.");
    try {
      await adminInquiriesApi.answer(id!, { answer });
      alert("답변이 등록되었습니다.");
      navigate("/admin/inquiries");
    } catch (e) {
      alert(
        (e as { message?: string })?.message ||
          "답변 등록 중 오류가 발생했습니다.",
      );
    }
  };

  if (!inquiry)
    return <div className="text-[15px] text-admin-muted">로딩중...</div>;

  const answered = inquiry.status === INQUIRY_STATUS.ANSWERED;

  return (
    <div className="max-w-[1100px]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-admin">1:1 문의 답변</h1>
        <button
          onClick={() => navigate("/admin/inquiries")}
          className="h-[44px] rounded-lg border border-admin-border bg-white px-5 text-[15px] text-ink"
        >
          목록으로
        </button>
      </div>

      <p className="mb-3 text-[14px] text-admin-muted">
        {`유형: ${typeLabel[inquiry.type] ?? inquiry.type} | 작성자: ${inquiry.member?.username ?? "-"} | ${fmtDateTime(inquiry.createdAt)} | 상태: ${answered ? "답변 완료" : "답변 대기"}`}
      </p>

      <h2 className="mb-5 text-[20px] font-bold text-admin">{inquiry.title}</h2>

      <div className="mb-8 min-h-[200px] whitespace-pre-wrap rounded-lg bg-admin-bg p-6 text-[15px] leading-relaxed text-ink">
        {inquiry.content}
      </div>

      <h3 className="mb-4 text-[18px] font-bold text-admin">답변 작성</h3>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="답변 내용을 입력해 주세요"
        disabled={answered}
        className="min-h-[230px] w-full resize-y rounded-lg border border-admin-border bg-admin-bg px-4 py-3 text-[15px] leading-relaxed text-ink outline-none placeholder:text-[#a6a6a6] disabled:opacity-70"
      />

      {!answered && (
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => navigate("/admin/inquiries")}
            className="h-[56px] w-[200px] rounded-lg border border-admin-border bg-white text-[16px] font-medium text-ink"
          >
            취소
          </button>
          <button
            onClick={submit}
            className="h-[56px] w-[220px] rounded-lg bg-admin text-[16px] font-medium text-white"
          >
            답변 등록
          </button>
        </div>
      )}
    </div>
  );
}
