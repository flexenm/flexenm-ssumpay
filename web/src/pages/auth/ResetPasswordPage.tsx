import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "@/api/auth";
import { getApiError } from "@/utils/error";
import { PASSWORD_REGEX, ERROR_MSG } from "@/utils/validators";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");

    if (!PASSWORD_REGEX.test(form.newPassword)) {
      setError(ERROR_MSG.password);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset({
        token: token!,
        newPassword: form.newPassword,
      });
      setDone(true);
    } catch (err) {
      const { message } = getApiError(err);
      setError(message ?? "비밀번호 재설정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  // 토큰 없이 접근한 경우
  if (!token) {
    return (
      <div className={centerClass}>
        <div className={cardClass}>
          <h2 className="mb-4 text-center text-2xl font-bold text-ink">
            잘못된 접근입니다
          </h2>
          <p className="text-center text-[15px] leading-[1.6] text-ink/70">
            비밀번호 재설정 링크가 올바르지 않습니다.
            <br />
            비밀번호 찾기를 다시 진행해주세요.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className={`${btnClass} cursor-pointer`}
          >
            비밀번호 찾기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={centerClass}>
      {done && (
        <div className={overlayClass} onClick={() => navigate("/signin")}>
          <div className={modalClass} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-center text-xl font-bold text-ink">
              비밀번호 변경 완료
            </h3>
            <p className="text-center text-[15px] leading-[1.6] text-ink/70">
              비밀번호가 변경되었습니다.
              <br />새 비밀번호로 로그인해주세요.
            </p>
            <button
              onClick={() => navigate("/signin")}
              className={`${btnClass} cursor-pointer`}
            >
              로그인하기
            </button>
          </div>
        </div>
      )}
      <div className={cardClass}>
        <h2 className="mb-9 text-center text-[30px] font-bold text-ink">
          비밀번호 재설정
        </h2>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>
              새 비밀번호 <span className="text-primary">*</span>
            </label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, newPassword: e.target.value }))
              }
              placeholder="8자 이상, 영문+숫자+특수문자"
              className={inputClass}
            />
            {form.newPassword && !PASSWORD_REGEX.test(form.newPassword) && (
              <p className="mt-1.5 text-xs text-red-500">{ERROR_MSG.password}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              새 비밀번호 확인 <span className="text-primary">*</span>
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, confirmPassword: e.target.value }))
              }
              placeholder="재입력"
              className={inputClass}
            />
          </div>
          {error && <p className="m-0 text-[13px] text-[#dc2626]">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className={`${btnClass} ${
              submitting
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer opacity-100"
            }`}
          >
            {submitting ? "처리 중..." : "비밀번호 변경"}
          </button>
        </form>
      </div>
    </div>
  );
}

const centerClass =
  "flex min-h-[70vh] items-center justify-center bg-page px-5 py-[60px]";
const overlayClass =
  "fixed inset-0 z-[1000] flex items-center justify-center bg-black/40";
const modalClass =
  "w-[360px] rounded-[26px] bg-white p-10 shadow-[0_8px_32px_rgba(0,0,0,0.16)]";
const cardClass =
  "w-[440px] rounded-[26px] bg-white px-10 py-14 shadow-[0_4px_24px_rgba(0,0,0,0.08)]";
const labelClass = "mb-1.5 block text-[14px] font-semibold text-ink";
const inputClass =
  "box-border w-full rounded-lg bg-field px-[18px] py-[14px] text-[15px] text-ink placeholder:text-ink/40 outline-none";
const btnClass =
  "mt-2 w-full rounded-lg border-none bg-navy py-[14px] text-[15px] font-semibold text-white";
