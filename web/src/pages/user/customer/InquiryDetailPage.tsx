import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tag, MoreVertical } from "lucide-react";
import { inquiriesApi } from "../../../api";
import type { Inquiry } from "../../../types";

const typeLabel: Record<number, string> = {
  1: "충전",
  2: "결제",
  3: "취소·환불",
  4: "기타",
};

const fmtDate = (s: string) => {
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inquiriesApi
      .get(id!)
      .then((r) => setInquiry(r.data))
      .catch(() => navigate(-1));
  }, [id]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openEdit = () => {
    setEditForm({ title: inquiry!.title, content: inquiry!.content });
    setEditing(true);
    setMenuOpen(false);
  };

  const saveEdit = async () => {
    try {
      await inquiriesApi.update(id!, editForm);
      const r = await inquiriesApi.get(id!);
      setInquiry(r.data);
      setEditing(false);
    } catch (e) {
      alert((e as { message?: string })?.message || "수정 중 오류가 발생했습니다.");
    }
  };

  const del = async () => {
    try {
      await inquiriesApi.delete(id!);
      navigate(-1);
    } catch (e) {
      alert((e as { message?: string })?.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  if (!inquiry) return <div className="p-20 text-center">로딩중...</div>;

  const isPending = inquiry.status === 0;

  return (
    <div className="mx-auto max-w-[900px] px-6 py-14">
      <p className="mb-3 text-center text-[14px] text-ink/40">
        홈 &gt; 고객센터 &gt; <span className="text-ink/60">1:1문의</span>
      </p>
      <h1 className="mb-14 text-center text-[48px] font-bold text-ink">
        고객센터
      </h1>

      {/* 상태 + 유형 + 메뉴 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3.5 py-1 text-[13px] font-medium ${isPending ? "bg-ink/10 text-ink/50" : "bg-primary text-white"}`}
          >
            {isPending ? "답변 대기" : "답변 완료"}
          </span>
          <span className="text-[13px] text-ink/50">
            문의 유형: {typeLabel[inquiry.type] || "기타"}
          </span>
        </div>
        {isPending && (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="cursor-pointer rounded-md bg-transparent p-1.5"
            >
              <MoreVertical size={20} className="text-ink/50" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-10 min-w-[100px] rounded-lg border border-line bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                <button
                  type="button"
                  onClick={openEdit}
                  className="block w-full cursor-pointer bg-transparent px-5 py-2.5 text-left text-[14px] text-ink"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirm(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full cursor-pointer bg-transparent px-5 py-2.5 text-left text-[14px] text-red-500"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 제목 + 날짜 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-[20px] font-bold text-ink">
          <Tag size={18} className="shrink-0 text-primary" strokeWidth={2} />
          {editing ? (
            <input
              value={editForm.title}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, title: e.target.value }))
              }
              className="w-[400px] max-w-full rounded-md border border-primary px-2.5 py-1 text-[20px] font-bold outline-none"
            />
          ) : (
            inquiry.title
          )}
        </h2>
        <span className="ml-4 shrink-0 text-[13px] text-ink/40">
          {fmtDate(inquiry.createdAt)}
        </span>
      </div>

      <hr className="mb-6 border-t-2 border-navy-rule" />

      {/* 문의 내용 */}
      {editing ? (
        <textarea
          value={editForm.content}
          onChange={(e) =>
            setEditForm((p) => ({ ...p, content: e.target.value }))
          }
          rows={10}
          className="mb-6 box-border w-full resize-y rounded-lg border border-primary p-4 text-[15px] leading-[1.8] outline-none"
        />
      ) : (
        <div className="min-h-[160px] whitespace-pre-wrap px-1 text-[15px] leading-[1.8] text-ink/80">
          {inquiry.content}
        </div>
      )}

      {!editing && <hr className="mt-8 border-t border-line" />}

      {editing && (
        <div className="mb-10 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="cursor-pointer rounded-lg border border-line bg-white px-6 py-2.5"
          >
            취소
          </button>
          <button
            type="button"
            onClick={saveEdit}
            className="cursor-pointer rounded-lg bg-navy px-6 py-2.5 font-semibold text-white"
          >
            저장
          </button>
        </div>
      )}

      {/* 답변 (답변 완료) */}
      {!editing && !isPending && inquiry.answer && (
        <div className="mt-12">
          <h3 className="mb-4 border-b-2 border-navy-rule pb-4 text-[18px] font-bold text-ink">
            답변
          </h3>
          <div className="whitespace-pre-wrap rounded-lg bg-field px-6 py-6 text-[15px] leading-[1.8] text-ink/80">
            {inquiry.answer}
          </div>
        </div>
      )}

      {!editing && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cursor-pointer rounded-lg bg-navy px-10 py-3 text-[15px] font-semibold text-white"
          >
            목록으로
          </button>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="w-[360px] rounded-xl bg-white p-8 text-center">
            <p className="mb-2 text-base font-bold">문의를 삭제하시겠습니까?</p>
            <p className="mb-6 text-sm text-ink/50">
              삭제된 문의는 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 cursor-pointer rounded-lg border border-line bg-white p-3"
              >
                취소
              </button>
              <button
                type="button"
                onClick={del}
                className="flex-1 cursor-pointer rounded-lg bg-red-500 p-3 font-semibold text-white"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
