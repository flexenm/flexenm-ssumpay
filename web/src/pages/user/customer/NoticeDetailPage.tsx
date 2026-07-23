import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { noticesApi } from "../../../api";
import type { Notice } from "../../../types";

const fmtDate = (s: string) => {
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    noticesApi
      .get(id!)
      .then((r) => setNotice(r.data))
      .catch(() => navigate("/customer"));
  }, [id]);

  if (!notice) return <div className="p-20 text-center">로딩중...</div>;

  return (
    <div className="mx-auto max-w-[800px] px-6 py-14">
      <p className="mb-3 text-center text-[14px] text-ink/40">
        홈 &gt; 고객센터 &gt; <span className="text-ink/60">공지사항</span>
      </p>
      <h1 className="mb-14 text-center text-[48px] font-bold text-ink">
        고객센터
      </h1>

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bookmark size={18} className="shrink-0 text-primary" strokeWidth={2} />
          <h2 className="text-[20px] font-bold text-ink">{notice.title}</h2>
        </div>
        <span className="ml-4 shrink-0 text-[13px] text-ink/40">
          {fmtDate(notice.createdAt)}
        </span>
      </div>

      <hr className="mb-8 border-t-2 border-navy-rule" />

      <div className="min-h-[240px] whitespace-pre-wrap px-1 text-[15px] leading-[1.8] text-ink/80">
        {notice.content}
      </div>

      <hr className="mt-8 border-t border-line" />

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={() => navigate("/customer")}
          className="cursor-pointer rounded-lg bg-navy px-10 py-3 text-[15px] font-semibold text-white"
        >
          목록으로
        </button>
      </div>
    </div>
  );
}
