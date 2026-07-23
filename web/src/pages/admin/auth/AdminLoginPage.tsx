import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuthApi } from "@/api";
import { setAdminAccessToken } from "@/utils/cookie";
import { refreshAdminMe } from "@/hooks/useAdminMe";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await adminAuthApi.login(form);
      setAdminAccessToken(res.token, res.expiresIn);
      // 이전 세션의 관리자 정보 캐시를 무효화 → 가드/레이아웃이 새 계정으로 다시 조회
      refreshAdminMe();
      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        (err as { message?: string })?.message || "로그인에 실패했습니다.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg">
      <div className="w-[600px] max-w-[calc(100%-32px)] rounded-2xl border border-admin-border bg-white p-12">
        <h2 className="mb-8 text-center text-[26px] font-bold text-ink">
          ssumpay ADMIN
        </h2>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            value={form.username}
            onChange={(e) =>
              setForm((p) => ({ ...p, username: e.target.value }))
            }
            placeholder="관리자 아이디"
            className={inputClass}
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            placeholder="비밀번호"
            className={inputClass}
          />
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <button
            type="submit"
            className="mt-2 h-[56px] cursor-pointer rounded-lg bg-admin text-[17px] font-semibold text-white"
          >
            로그인
          </button>
        </form>
        <p className="mt-4 text-center text-[13px] text-[#a6a6a6]">
          ※ 허용된 관리자 계정만 접근 가능 (IP 접근 제한 권장)
        </p>
        <div className="mt-6 rounded-lg border border-admin-line bg-admin-bg p-4 text-[13px] text-admin-muted">
          <p className="mb-2 font-semibold text-ink">테스트 계정</p>
          <p>
            아이디: <span className="font-medium text-ink">admin</span>
          </p>
          <p>
            비밀번호: <span className="font-medium text-ink">admin1234</span>
          </p>
          <button
            type="button"
            onClick={() =>
              setForm({ username: "admin", password: "admin1234" })
            }
            className="mt-3 cursor-pointer rounded-md border border-admin-border bg-white px-3 py-1.5 text-xs font-medium text-ink"
          >
            자동입력
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "h-[52px] rounded-lg border border-admin-border bg-admin-bg px-4 text-[15px] text-ink placeholder:text-[#a6a6a6] outline-none";
