import { useState, useRef } from "react";
import type { FormEvent, ChangeEvent, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Upload, X } from "lucide-react";
import { createInquiry } from "@/api/inquiries";
import { getApiError } from "@/utils/error";

const TITLE_MAX = 50;
const CONTENT_MAX = 1000;
const IMAGE_MAX_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function InquiryFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<{
    type: "" | number;
    title: string;
    content: string;
  }>({ type: "", title: "", content: "" });
  const typeSelected = form.type !== "";
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const applyFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("JPG, PNG, GIF, WEBP 이미지만 첨부할 수 있습니다.");
      return;
    }
    if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
      setError(`이미지 크기는 ${IMAGE_MAX_MB}MB 이하여야 합니다.`);
      return;
    }
    setError("");
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) applyFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) applyFile(file);
  };

  const removeImage = () => {
    setImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!typeSelected || !form.title || !form.content) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    if (form.title.length > TITLE_MAX) {
      setError(`제목은 ${TITLE_MAX}자 이내로 입력해주세요.`);
      return;
    }
    if (form.content.length > CONTENT_MAX) {
      setError(`내용은 ${CONTENT_MAX}자 이내로 입력해주세요.`);
      return;
    }
    try {
      await createInquiry({ ...(form as { type: number; title: string; content: string }), image });
      alert("문의가 등록되었습니다.");
      navigate("/cs");
    } catch (err) {
      const { message } = getApiError(err);
      setError(message ?? "문의 등록에 실패했습니다.");
    }
  };

  return (
    <div className="mx-auto max-w-[800px] px-6 py-14">
      <p className="mb-3 text-center text-[14px] text-ink/40">
        홈 &gt; 고객센터 &gt; <span className="text-ink/60">1:1문의</span>
      </p>
      <h1 className="mb-14 text-center text-[48px] font-bold text-ink">
        고객센터
      </h1>

      <h2 className="mb-5 border-b-2 border-navy-rule pb-4 text-[20px] font-bold text-ink">
        1:1 문의 작성
      </h2>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <div>
          <label className={labelClass}>
            문의 유형 <span className="text-primary">*</span>
          </label>
          <div className="relative w-[350px] max-w-full">
            <select
              value={form.type}
              onChange={(e) =>
                setForm((p) => ({ ...p, type: Number(e.target.value) }))
              }
              className={`${fieldClass} w-full cursor-pointer appearance-none pr-11`}
            >
              <option value="">문의 유형 선택 (충전/결제/취소·환불/기타)</option>
              <option value={1}>충전</option>
              <option value={2}>결제</option>
              <option value={3}>취소·환불</option>
              <option value={4}>기타</option>
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/40"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            제목 <span className="text-primary">*</span>
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder={`제목을 입력해주세요 (최대 ${TITLE_MAX}자)`}
            maxLength={TITLE_MAX}
            className={`${fieldClass} w-full`}
          />
          <p className="mt-1 text-right text-xs text-ink/40">
            {form.title.length}/{TITLE_MAX}
          </p>
        </div>

        <div>
          <label className={labelClass}>
            문의 내용 <span className="text-primary">*</span>
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            placeholder="문의 내용을 입력해 주세요.&#10;충전 관련 문의 시 주문번호와 플렉스티비 아이디를 함께 적어주시면 빠른 처리가 가능합니다."
            maxLength={CONTENT_MAX}
            className={`${fieldClass} min-h-[300px] w-full resize-y leading-[1.7]`}
          />
          <p className="mt-1 text-right text-xs text-ink/40">
            {form.content.length}/{CONTENT_MAX}
          </p>
        </div>

        <div>
          <label className={labelClass}>첨부파일</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !preview && fileRef.current?.click()}
            className={`relative flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors
              ${dragOver ? "border-primary bg-primary/5" : "border-ink/20 bg-field hover:border-ink/40"}
              ${preview ? "cursor-default" : ""}`}
          >
            {preview ? (
              <div className="relative p-4">
                <img
                  src={preview}
                  alt="첨부 이미지 미리보기"
                  className="max-h-[200px] max-w-full rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  className="absolute right-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-ink/60 text-white hover:bg-ink"
                >
                  <X size={13} />
                </button>
                <p className="mt-2 text-center text-xs text-ink/50">{image?.name}</p>
              </div>
            ) : (
              <>
                <Upload size={22} className="text-ink/40" />
                <span className="text-[14px] font-medium text-ink/60">이미지 업로드</span>
                <span className="text-[13px] text-ink/40">여기로 이미지를 드래그 하세요.</span>
                <span className="mt-1 text-[12px] text-ink/30">JPG · PNG · GIF · WEBP, 최대 5MB</span>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFile}
            className="hidden"
          />
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <div className="mt-2 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cursor-pointer rounded-lg border border-navy bg-white px-10 py-3 text-[15px] font-medium text-ink"
          >
            취소
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-navy px-10 py-3 text-[15px] font-semibold text-white"
          >
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
}

const labelClass = "mb-2 block text-[14px] font-semibold text-ink";
const fieldClass =
  "box-border rounded-lg bg-field px-[18px] py-[14px] text-[15px] text-ink placeholder:text-ink/40 outline-none";
