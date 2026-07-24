import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { inquiriesApi } from "@/api";
import type { CreateInquiryInput } from "@/api";

const TITLE_MAX = 50;
const CONTENT_MAX = 1000;

export default function InquiryFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<{
    type: "" | number;
    title: string;
    content: string;
  }>({ type: "", title: "", content: "" });
  const typeSelected = form.type !== "";
  const [error, setError] = useState("");

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
      await inquiriesApi.create(form as CreateInquiryInput);
      alert("문의가 등록되었습니다.");
      navigate("/customer");
    } catch (err) {
      setError(
        (err as { message?: string })?.message || "문의 등록에 실패했습니다.",
      );
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
