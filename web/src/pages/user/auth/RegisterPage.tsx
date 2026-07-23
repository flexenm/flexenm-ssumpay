import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api";

const PHONE_PREFIXES = ["010", "011", "016", "017", "018", "019"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
    name: "",
    email: "",
  });
  const [phone, setPhone] = useState({ prefix: "010", mid: "", last: "" });
  const [usernameOk, setUsernameOk] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const checkUsername = async () => {
    if (!form.username) return;
    try {
      const res = await authApi.checkUsername(form.username);
      setUsernameOk(res.available);
    } catch {
      setUsernameOk(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!usernameOk) {
      setError("아이디 중복확인을 해주세요.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    const phoneValue = `${phone.prefix}-${phone.mid}-${phone.last}`;
    try {
      await authApi.register({
        username: form.username,
        password: form.password,
        name: form.name,
        phone: phoneValue,
        email: form.email,
      });
      alert("회원가입이 완료되었습니다.");
      navigate("/login");
    } catch (err) {
      setError((err as { message?: string })?.message || "회원가입에 실패했습니다.");
    }
  };

  const set =
    (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      if (key === "username") setUsernameOk(null);
    };

  const setPhonePart =
    (key: keyof typeof phone) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        key === "prefix"
          ? e.target.value
          : e.target.value.replace(/\D/g, "").slice(0, 4);
      setPhone((p) => ({ ...p, [key]: value }));
    };

  return (
    <div className="flex min-h-[70vh] justify-center bg-page px-5 py-[60px]">
      <div className="h-fit w-[480px] rounded-[26px] bg-white px-10 py-14 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <h2 className="text-center text-[30px] font-bold text-ink">회원가입</h2>
        <p className="mt-2 mb-9 text-center text-[15px] text-ink/50">
          회원이 되시면, 더 다양한 서비스를 이용하실 수 있습니다
        </p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>
              아이디 <span className="text-primary">*</span>
            </label>
            <div className="flex gap-2">
              <input
                value={form.username}
                onChange={set("username")}
                placeholder="아이디 입력 (영문+숫자 4~16자)"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={checkUsername}
                className="cursor-pointer whitespace-nowrap rounded-full border-none bg-primary px-5 text-[14px] font-medium text-white"
              >
                중복확인
              </button>
            </div>
            {usernameOk === true && (
              <p className="mt-1.5 text-xs text-[#22c55e]">
                사용 가능한 아이디입니다.
              </p>
            )}
            {usernameOk === false && (
              <p className="mt-1.5 text-xs text-red-500">
                이미 사용 중인 아이디입니다.
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              비밀번호 <span className="text-primary">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="비밀번호 입력 (8자 이상, 영문+숫자+특수문자)"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              비밀번호 확인 <span className="text-primary">*</span>
            </label>
            <input
              type="password"
              value={form.passwordConfirm}
              onChange={set("passwordConfirm")}
              placeholder="비밀번호 재입력"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              이름 <span className="text-primary">*</span>
            </label>
            <input
              value={form.name}
              onChange={set("name")}
              placeholder="이름 입력"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              휴대전화 <span className="text-primary">*</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={phone.prefix}
                onChange={setPhonePart("prefix")}
                className={`${inputClass} flex-1 cursor-pointer`}
              >
                {PHONE_PREFIXES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <span className="text-ink/40">-</span>
              <input
                value={phone.mid}
                onChange={setPhonePart("mid")}
                inputMode="numeric"
                maxLength={4}
                placeholder="0000"
                className={`${inputClass} flex-1 text-center`}
              />
              <span className="text-ink/40">-</span>
              <input
                value={phone.last}
                onChange={setPhonePart("last")}
                inputMode="numeric"
                maxLength={4}
                placeholder="0000"
                className={`${inputClass} flex-1 text-center`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>
              이메일 <span className="text-primary">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="example@email.com"
              className={inputClass}
            />
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <button
            type="submit"
            className="mt-2 cursor-pointer rounded-lg border-none bg-navy py-[14px] text-[15px] font-semibold text-white"
          >
            가입하기
          </button>
        </form>
        <p className="mt-4 text-center text-[14px] text-ink/50">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="font-medium text-primary">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelClass = "mb-1.5 block text-[14px] font-semibold text-ink";
const inputClass =
  "box-border w-full rounded-lg bg-field px-[18px] py-[14px] text-[15px] text-ink placeholder:text-ink/40 outline-none";
