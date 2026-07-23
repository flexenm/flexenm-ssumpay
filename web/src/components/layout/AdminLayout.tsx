import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { removeAdminAccessToken } from "@/utils/cookie";
import { useAdminMe, removeAdminMe } from "@/hooks/useAdminMe";

const menus = [
  { path: "/admin/dashboard", label: "대시보드" },
  { path: "/admin/orders", label: "주문·충전 관리" },
  { path: "/admin/products", label: "상품 관리" },
  { path: "/admin/members", label: "회원 관리" },
  { path: "/admin/notices", label: "공지사항 관리" },
  { path: "/admin/inquiries", label: "1:1 문의 관리" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: admin } = useAdminMe();

  const logout = () => {
    removeAdminAccessToken();
    // 캐시에 남은 관리자 정보 제거 → 다른 계정 재로그인 시 이전 이름이 보이지 않도록
    removeAdminMe();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* 상단 다크 헤더 */}
      <header className="flex h-16 shrink-0 items-center justify-between bg-admin px-10 text-white">
        <span className="text-xl font-bold">ssumpay ADMIN</span>
        <div className="flex items-center gap-3 text-[13px] text-[#c7c7c7]">
          <span>{admin?.name || "admin@ssumpay"}</span>
          <span className="text-white/30">|</span>
          <button
            onClick={logout}
            className="cursor-pointer bg-transparent text-[#c7c7c7] hover:text-white"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* 라이트 사이드바 */}
        <aside className="w-[260px] shrink-0 border-r-2 border-admin-line bg-admin-bg py-4">
          <nav className="flex flex-col gap-1 px-4">
            {menus.map((m) => {
              const active = pathname.startsWith(m.path);
              return (
                <Link
                  key={m.path}
                  to={m.path}
                  className={`rounded-lg px-4 py-2.5 text-[15px] ${
                    active
                      ? "bg-admin-line font-medium text-admin"
                      : "text-admin-muted"
                  }`}
                >
                  {m.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto bg-white p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
