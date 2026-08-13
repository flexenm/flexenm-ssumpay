import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api";
import { setAccessToken } from "@/utils/cookie";
import { refreshMe } from "@/hooks/useMe";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await authApi.login(form);
      setAccessToken(res.accessToken, res.expiresIn);
      // 이전 세션의 내 정보 캐시를 무효화 → 가드가 새 계정으로 다시 조회
      refreshMe();
      navigate("/");
    } catch {
      // 계정 열거 방지: 계정 없음 / 비밀번호 불일치를 구분하지 않고 항상 동일 메시지 노출
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-page px-5 py-[60px]">
      <div className="w-[440px] rounded-[26px] bg-white px-10 py-14 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <h2 className="text-center text-[30px] font-bold text-ink">로그인</h2>
        <p className="mt-2 mb-9 text-center text-[15px] text-ink/50">
          오늘도 빠르고 안전한 결제 서비스를 제공하겠습니다
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            value={form.username}
            onChange={(e) =>
              setForm((p) => ({ ...p, username: e.target.value }))
            }
            placeholder="아이디 입력"
            className={inputClass}
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            placeholder="비밀번호 입력"
            className={inputClass}
          />
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <button type="submit" className={btnClass}>
            로그인
          </button>
        </form>
        <div className="mt-4 flex items-center justify-center gap-3 text-[14px] text-ink/40">
          <Link to="/signup" className="text-ink/40">
            회원가입
          </Link>
          <span className="text-line">|</span>
          <Link to="/forgot-password" className="text-ink/40">
            비밀번호 찾기
          </Link>
        </div>
        <div className="mt-6 rounded-lg border border-primary/15 bg-primary-soft p-4 text-[13px] text-ink/60">
          <p className="mb-2 font-semibold text-ink/80">테스트 계정</p>
          <p>
            아이디: <span className="font-medium text-ink">testuser2</span>
          </p>
          <p>
            비밀번호: <span className="font-medium text-ink">test1234</span>
          </p>
          <button
            type="button"
            onClick={() =>
              setForm({ username: "testuser2", password: "test1234" })
            }
            className="mt-3 cursor-pointer rounded-md border border-primary/30 bg-white px-3 py-1.5 text-xs font-medium text-primary"
          >
            자동입력
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "bg-field rounded-lg px-[18px] py-[14px] text-[15px] text-ink placeholder:text-ink/40 outline-none";
const btnClass =
  "mt-2 cursor-pointer rounded-lg border-none bg-navy py-[14px] text-[15px] font-semibold text-white";
