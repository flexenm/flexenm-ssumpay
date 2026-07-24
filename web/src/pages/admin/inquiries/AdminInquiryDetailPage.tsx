import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminInquiriesApi } from "@/api";
import { INQUIRY_STATUS } from "@/types";
import type { Inquiry, Member } from "@/types";

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

      <div className="mb-8 rounded-lg border border-admin-line bg-white px-6 py-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-[20px] font-bold text-admin">{inquiry.title}</h2>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-medium ${
              answered
                ? "border border-admin-border text-admin-muted"
                : "bg-admin text-white"
            }`}
          >
            {answered ? "답변 완료" : "답변 대기"}
          </span>
        </div>

        <dl className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[14px]">
          {[
            { label: "유형", value: typeLabel[inquiry.type] ?? inquiry.type },
            { label: "작성자", value: inquiry.member?.username ?? "-" },
            { label: "등록일", value: fmtDateTime(inquiry.createdAt) },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              <dt className="text-admin-muted">{m.label}</dt>
              <dd className="font-medium text-ink">{m.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 min-h-[200px] whitespace-pre-wrap border-t border-admin-line pt-5 text-[15px] leading-relaxed text-ink">
          {inquiry.content}
        </div>
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
