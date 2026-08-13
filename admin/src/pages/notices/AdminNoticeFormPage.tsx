import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createNotice, deleteNotice, fetchNotice, updateNotice } from "@/api/notices";
import type { NoticeParams } from "@/api/notices";
import { getApiError } from "@/utils/error";

interface NoticeForm {
  title: string;
  content: string;
  isPinned: boolean;
  isActive: number;
}

const empty: NoticeForm = {
  title: "",
  content: "",
  isPinned: false,
  isActive: 1,
};

const inputCls =
  "h-[52px] w-full rounded-lg border border-admin-border bg-admin-bg px-4 text-[15px] text-ink outline-none placeholder:text-[#a6a6a6]";

export default function AdminNoticeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<NoticeForm>(empty);
  const [loading, setLoading] = useState(isEdit);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchNotice(id)
      .then((notice) =>
        setForm({
          title: notice.title,
          content: notice.content,
          isPinned: !!notice.isPinned,
          isActive: notice.isActive,
        }),
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert("제목과 본문을 입력해 주세요.");
      return;
    }
    try {
      const payload = form as unknown as NoticeParams;
      if (isEdit) await updateNotice(id!, payload);
      else await createNotice(payload);
      navigate("/notices");
    } catch (e) {
      alert(getApiError(e).message ?? "저장 중 오류가 발생했습니다.");
    }
  };

  const del = async () => {
    try {
      await deleteNotice(id!);
      navigate("/notices");
    } catch (e) {
      alert(getApiError(e).message ?? "삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return <p className="text-[14px] text-admin-muted">불러오는 중...</p>;
  }

  return (
    <div className="max-w-[900px]">
      <p className="mb-2 text-[13px] text-admin-muted">
        공지사항 관리 &gt; {isEdit ? "공지사항 수정" : "공지사항 등록"}
      </p>
      <h1 className="mb-8 text-[24px] font-bold text-admin">
        {isEdit ? "공지사항 수정" : "공지사항 등록"}
      </h1>

      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block text-[15px] font-medium text-ink">
            제목 <span className="text-admin">*</span>
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="공지 제목을 입력해 주세요"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-medium text-ink">
            본문 <span className="text-admin">*</span>
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            placeholder="공지 내용을 입력해 주세요"
            className="min-h-[380px] w-full resize-y rounded-lg border border-admin-border bg-admin-bg px-4 py-3 text-[15px] leading-relaxed text-ink outline-none placeholder:text-[#a6a6a6]"
          />
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-medium text-ink">
            필독 여부
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isPinned: true }))}
              className={`h-[44px] w-[90px] rounded-lg text-[14px] font-medium ${
                form.isPinned
                  ? "bg-admin text-white"
                  : "border border-admin-border bg-white text-admin-muted"
              }`}
            >
              Y
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isPinned: false }))}
              className={`h-[44px] w-[90px] rounded-lg text-[14px] font-medium ${
                !form.isPinned
                  ? "bg-admin text-white"
                  : "border border-admin-border bg-white text-admin-muted"
              }`}
            >
              N
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-medium text-ink">
            노출 여부
          </label>
          <select
            value={form.isActive}
            onChange={(e) =>
              setForm((p) => ({ ...p, isActive: Number(e.target.value) }))
            }
            className="h-[44px] rounded-lg border border-admin-border bg-admin-bg px-4 text-[15px] text-ink outline-none"
          >
            <option value={1}>공개</option>
            <option value={0}>비공개</option>
          </select>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <div>
          {isEdit && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="h-[52px] w-[120px] rounded-lg border border-admin-border bg-white text-[15px] text-ink"
            >
              삭제
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/notices")}
            className="h-[52px] w-[120px] rounded-lg border border-admin-border bg-white text-[15px] text-ink"
          >
            취소
          </button>
          <button
            onClick={submit}
            className="h-[52px] w-[120px] rounded-lg bg-admin text-[15px] font-medium text-white"
          >
            {isEdit ? "저장" : "등록"}
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-[400px] max-w-full rounded-2xl bg-white p-8 text-center">
            <p className="mb-3 text-[18px] font-bold text-admin">
              공지를 삭제하시겠습니까?
            </p>
            <p className="mb-7 text-[14px] text-admin-muted">
              삭제된 공지는 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="h-[52px] flex-1 rounded-lg border border-admin-border bg-white text-[15px] text-ink"
              >
                취소
              </button>
              <button
                onClick={del}
                className="h-[52px] flex-1 rounded-lg bg-admin text-[15px] font-medium text-white"
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
