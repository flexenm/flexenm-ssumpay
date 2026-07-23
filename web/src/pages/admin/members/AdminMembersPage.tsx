import { useState, useEffect } from "react";
import { adminMembersApi } from "@/api";
import { MEMBER_STATUS } from "@/types";
import type { Member } from "@/types";
import DummyBadge from "@/components/ui/DummyBadge";

const fmtDateTime = (s: string) => {
  const d = new Date(s);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

// 백엔드 미제공 필드 더미값. member.id 기반으로 안정적인 값을 생성한다.
const dummyOrderCount = (id: number) => `${id % 6}건`;
const dummyLastAccess = (id: number) => {
  const d = new Date(2026, 6, 14 - (id % 4));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
};

const TH = "px-5 h-[52px] text-left text-[14px] font-medium text-admin-muted";
const TD = "px-5 py-4 text-[14px] text-ink";

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const load = (kw = keyword) => {
    setLoading(true);
    adminMembersApi
      .list({ keyword: kw })
      .then((r) => setMembers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load("");
  }, []);

  const toggleStatus = async (m: Member) => {
    await adminMembersApi.updateStatus(m.id, {
      status:
        m.status === MEMBER_STATUS.NORMAL
          ? MEMBER_STATUS.BLOCKED
          : MEMBER_STATUS.NORMAL,
    });
    load();
  };

  return (
    <div>
      <h1 className="mb-8 text-[24px] font-bold text-admin">회원 관리</h1>

      <div className="mb-6 flex gap-3">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(keyword)}
          placeholder="아이디 / 이메일 검색"
          className="h-[52px] w-[420px] max-w-full rounded-lg border border-admin-border bg-admin-bg px-4 text-[15px] text-ink outline-none placeholder:text-[#a6a6a6]"
        />
        <button
          onClick={() => load(keyword)}
          className="h-[52px] w-[110px] rounded-lg bg-admin text-[15px] font-medium text-white"
        >
          검색
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-admin-head">
              <th className={TH}>아이디</th>
              <th className={TH}>이메일</th>
              <th className={TH}>가입일</th>
              <th className={TH}>
                <span className="inline-flex items-center gap-1.5">
                  누적 주문
                  <DummyBadge />
                </span>
              </th>
              <th className={TH}>
                <span className="inline-flex items-center gap-1.5">
                  최근 접속
                  <DummyBadge />
                </span>
              </th>
              <th className={TH}>상태</th>
              <th className={TH}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center text-[14px] text-admin-muted"
                >
                  불러오는 중...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center text-[14px] text-admin-muted"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} className="border-b border-admin-line">
                  <td className={TD}>{m.username}</td>
                  <td className={TD}>{m.email}</td>
                  <td className={TD}>{fmtDateTime(m.createdAt)}</td>
                  <td className={TD}>{dummyOrderCount(m.id)}</td>
                  <td className={TD}>{dummyLastAccess(m.id)}</td>
                  <td className={TD}>
                    {m.status === MEMBER_STATUS.NORMAL ? "정상" : "정지"}
                  </td>
                  <td className={TD}>
                    <button
                      onClick={() => toggleStatus(m)}
                      className="text-[14px] text-admin-muted hover:text-admin hover:underline"
                    >
                      {m.status === MEMBER_STATUS.NORMAL ? "정지" : "해제"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-[14px] text-admin-muted">
        ※ 행 클릭 시 회원 상세(주문 내역 포함) · 상태 변경(정상/정지) 가능
      </p>
    </div>
  );
}
