import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuthApi } from "../../../api";
import { setAdminAccessToken, setAdminInfo } from "../../../utils/cookie";

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
      setAdminInfo(res.admin, res.expiresIn);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        (err as { message?: string })?.message || "로그인에 실패했습니다.",
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="bg-white rounded-2xl p-12 w-[380px] shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <h2 className="text-center text-[22px] font-bold mb-8">
          ssumpay ADMIN
        </h2>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            value={form.username}
            onChange={(e) =>
              setForm((p) => ({ ...p, username: e.target.value }))
            }
            placeholder="아이디"
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
          {error && <p className="text-red-500 text-[13px]">{error}</p>}
          <button
            type="submit"
            className="p-3.5 bg-slate-800 text-white border-none rounded-lg text-[15px] font-semibold cursor-pointer mt-2"
          >
            로그인
          </button>
        </form>
        <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-[13px] text-slate-600">
          <p className="mb-2 font-semibold text-slate-700">테스트 계정</p>
          <p>
            아이디: <span className="font-medium text-slate-800">admin</span>
          </p>
          <p>
            비밀번호:{" "}
            <span className="font-medium text-slate-800">admin1234</span>
          </p>
          <button
            type="button"
            onClick={() =>
              setForm({ username: "admin", password: "admin1234" })
            }
            className="mt-3 cursor-pointer rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600"
          >
            자동입력
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none";
