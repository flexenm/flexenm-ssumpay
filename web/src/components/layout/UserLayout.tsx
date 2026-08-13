import { Outlet, Link, useNavigate } from "react-router-dom";
import { logout as logoutApi } from "@/api/auth";
import { clearMe, useMe } from "@/hooks/useMe";
import logo from "@/assets/img/logo.png";

export default function UserLayout() {
  const navigate = useNavigate();
  const { isLoggedIn } = useMe();

  const logout = async () => {
    // 쿠키가 HttpOnly 라 JS 가 지울 수 없다 — 서버가 만료시켜야 한다.
    // 서버 호출이 실패해도(만료된 세션 등) 클라이언트 상태는 정리하고 로그인 화면으로 보낸다.
    try {
      await logoutApi();
    } catch {
      // 서버 폐기 실패는 사용자에게 알릴 것이 없다 — 로그아웃 자체는 진행한다.
    }
    // 캐시에 남은 내 정보 제거 → 다른 계정 재로그인 시 이전 정보가 남지 않도록
    clearMe();
    navigate("/signin");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e7e7e7] bg-white/80 px-10 backdrop-blur-md">
        <Link to="/">
          <img src={logo} alt="ssumpay" className="h-[29px]" />
        </Link>
        <nav className="flex items-center gap-7 text-[15px] text-ink">
          <Link to="/cs" className="hover:text-primary">
            고객센터
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/mypage" className="hover:text-primary">
                마이페이지
              </Link>
              <button
                onClick={logout}
                className="cursor-pointer rounded-full border border-primary px-4 py-1.5 text-sm text-primary"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              className="rounded-full bg-primary px-4 py-1.5 text-sm text-white"
            >
              로그인
            </Link>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#d7d7d7] bg-navy-rule px-10 py-10 text-[13px] text-white/40">
        <div className="mx-auto max-w-[1200px]">
          <p>
            업체명 | 대표자명: 000 &nbsp; 사업자등록번호: 00000 &nbsp; 주소:
            000000 &nbsp; Tel: 00000000
          </p>
          <div className="mt-3 flex gap-5">
            {["이용약관", "개인정보처리방침", "고객센터", "사업자정보"].map(
              (t) => (
                <Link
                  key={t}
                  to="/cs"
                  className="text-white/50 hover:text-white/80"
                >
                  {t}
                </Link>
              ),
            )}
          </div>
          <p className="mt-3 text-white/20">
            © 2026 ssumpay. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
