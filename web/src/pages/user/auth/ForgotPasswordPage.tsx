import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api";
import emailSentImg from "@/assets/img/email-sent.png";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "" });
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const request = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // 서버는 계정 존재 여부와 무관하게 동일 응답을 주므로, 실패 여부와 관계없이 동일 안내를 노출한다.
      await authApi.resetPassword(form);
    } catch {
      // 열거 방지: 오류가 나더라도 계정 존재를 드러내지 않도록 동일 안내를 유지
    } finally {
      setSubmitting(false);
      setDone(true);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    request();
  };

  if (done) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-page px-5 py-[80px] text-center">
        <img
          src={emailSentImg}
          alt="이메일 발송 완료"
          className="h-[180px] w-[180px] object-contain"
        />
        <h2 className="mt-8 text-[30px] font-bold leading-[44px] text-ink">
          입력하신 이메일로
          <br />
          비밀번호 재설정 링크를 보냈습니다
        </h2>
        <p className="mt-4 text-[15px] leading-[24px] text-ink/50">
          입력하신 정보로 가입된 계정이 있다면,
          <br />
          비밀번호 재설정 링크를 메일로 보내드렸습니다. 링크는 30분간
          유효합니다.
        </p>
        <button
          onClick={() => navigate("/signin")}
          className="mt-10 cursor-pointer rounded-lg border-none bg-navy px-10 py-[13px] text-[15px] font-medium text-white"
        >
          로그인 하러 가기
        </button>
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[14px]">
          <span className="text-ink/40">이메일이 오지 않았나요?</span>
          <button
            type="button"
            onClick={request}
            disabled={submitting}
            className="cursor-pointer border-none bg-transparent p-0 font-medium text-ink/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            재발송
          </button>
          <span className="text-ink/30">|</span>
          <Link to="/cs" className="font-medium text-ink/70">
            고객센터 문의
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-page px-5 py-[60px]">
      <div className="w-[440px] rounded-[26px] bg-white px-10 py-14 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <h2 className="mb-9 text-center text-[30px] font-bold text-ink">
          비밀번호 찾기
        </h2>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>
              아이디 <span className="text-primary">*</span>
            </label>
            <input
              value={form.username}
              onChange={(e) =>
                setForm((p) => ({ ...p, username: e.target.value }))
              }
              placeholder="아이디 입력 (영문+숫자 4~16자)"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              이메일 <span className="text-primary">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="example@email.com"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`mt-2 rounded-lg border-none bg-navy py-[14px] text-[15px] font-semibold text-white ${
              submitting
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer opacity-100"
            }`}
          >
            {submitting ? "처리 중..." : "비밀번호 찾기"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelClass = "mb-1.5 block text-[14px] font-semibold text-ink";
const inputClass =
  "box-border w-full rounded-lg bg-field px-[18px] py-[14px] text-[15px] text-ink placeholder:text-ink/40 outline-none";
