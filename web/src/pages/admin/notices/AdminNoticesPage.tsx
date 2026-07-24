import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminNoticesApi } from "@/api";
import type { AdminNoticeListParams } from "@/api";
import type { Notice } from "@/types";

type ModalType = "view" | "delete";

const fmtDateTime = (s: string) => {
  const d = new Date(s);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

const TH = "px-5 h-[52px] text-left text-[14px] font-medium text-admin-muted";
const TD = "px-5 py-4 text-[14px] text-ink";

export default function AdminNoticesPage() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType | null>(null);
  const [selected, setSelected] = useState<Notice | null>(null);
  const [pinnedFilter, setPinnedFilter] = useState("");
  const [titleKeyword, setTitleKeyword] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({ pinned: "", title: "" });

  // 등록·수정·삭제 후 재조회 시에도 적용 중인 필터를 유지한다.
  const load = (pinned = appliedFilter.pinned, title = appliedFilter.title) => {
    const params: AdminNoticeListParams = {};
    if (pinned !== "") params.isPinned = pinned === "Y" ? 1 : 0;
    if (title) params.keyword = title;
    setLoading(true);
    return adminNoticesApi
      .list(params)
      .then((r) => setNotices(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load("", "");
  }, []);

  const openView = (n: Notice) => {
    setSelected(n);
    setModal("view");
  };
  const openDelete = (n: Notice) => {
    setSelected(n);
    setModal("delete");
  };

  const del = async () => {
    try {
      await adminNoticesApi.delete(selected!.id);
      setModal(null);
      load();
    } catch (e) {
      alert(
        (e as { message?: string })?.message || "삭제 중 오류가 발생했습니다.",
      );
    }
  };

  const applySearch = () => {
    setAppliedFilter({ pinned: pinnedFilter, title: titleKeyword });
    load(pinnedFilter, titleKeyword);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-admin">공지사항 관리</h1>
        <button
          onClick={() => navigate("/admin/notices/new")}
          className="h-[52px] rounded-lg bg-admin px-6 text-[15px] font-medium text-white"
        >
          + 공지 등록
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={pinnedFilter}
          onChange={(e) => {
            setPinnedFilter(e.target.value);
            setAppliedFilter((f) => ({ ...f, pinned: e.target.value }));
            load(e.target.value, appliedFilter.title);
          }}
          className="h-[52px] w-[200px] rounded-lg border border-admin-border bg-admin-bg px-4 text-[15px] text-ink outline-none"
        >
          <option value="">필독 여부: 전체</option>
          <option value="Y">필독 여부: Y</option>
          <option value="N">필독 여부: N</option>
        </select>
        <input
          value={titleKeyword}
          onChange={(e) => setTitleKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applySearch()}
          placeholder="제목 검색"
          className="h-[52px] w-[360px] max-w-full rounded-lg border border-admin-border bg-admin-bg px-4 text-[15px] text-ink outline-none placeholder:text-[#a6a6a6]"
        />
        <button
          onClick={applySearch}
          className="h-[52px] w-[110px] rounded-lg bg-admin text-[15px] font-medium text-white"
        >
          검색
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-admin-head">
              <th className={`${TH} w-[100px]`}>번호</th>
              <th className={TH}>제목</th>
              <th className={`${TH} w-[220px]`}>등록일</th>
              <th className={`${TH} w-[120px]`}>필독 여부</th>
              <th className={`${TH} w-[140px]`}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-[14px] text-admin-muted"
                >
                  불러오는 중...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-[14px] text-admin-muted"
                >
                  공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((n) => (
                <tr key={n.id} className="border-b border-admin-line">
                  <td className={TD}>{n.id}</td>
                  <td
                    className={`${TD} cursor-pointer hover:underline`}
                    onClick={() => openView(n)}
                  >
                    {n.title}
                  </td>
                  <td className={TD}>{fmtDateTime(n.createdAt)}</td>
                  <td className={TD}>{n.isPinned ? "Y" : "N"}</td>
                  <td className={TD}>
                    <button
                      onClick={() => navigate(`/admin/notices/${n.id}/edit`)}
                      className="text-admin-muted hover:text-admin hover:underline"
                    >
                      수정
                    </button>
                    <span className="mx-2 text-admin-line">·</span>
                    <button
                      onClick={() => openDelete(n)}
                      className="text-admin-muted hover:text-admin hover:underline"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-[14px] leading-relaxed text-admin-muted">
        <p>※ 등록/수정: 제목 + 본문 + 필독 여부</p>
        <p>※ 노출 ON 공지만 사용자 고객센터 &gt; 공지사항에 표시</p>
      </div>

      {modal === "view" && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-[640px] max-w-full overflow-auto rounded-2xl bg-white p-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="text-[20px] font-bold text-admin">
                {selected.title}
              </h3>
              <span className="whitespace-nowrap text-[14px] text-admin-muted">
                {fmtDateTime(selected.createdAt)}
              </span>
            </div>
            <div className="mt-4 min-h-[160px] whitespace-pre-wrap border-t border-admin-line pt-5 text-[15px] leading-relaxed text-ink">
              {selected.content}
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                className="h-[52px] w-[120px] rounded-lg border border-admin-border bg-white text-[15px] text-ink"
              >
                닫기
              </button>
              <button
                onClick={() => navigate(`/admin/notices/${selected.id}/edit`)}
                className="h-[52px] w-[120px] rounded-lg bg-admin text-[15px] font-medium text-white"
              >
                수정
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "delete" && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-[400px] max-w-full rounded-2xl bg-white p-8 text-center">
            <p className="mb-3 text-[18px] font-bold text-admin">
              공지를 삭제하시겠습니까?
            </p>
            <p className="mb-7 text-[14px] text-admin-muted">
              삭제된 공지는 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="h-[52px] flex-1 rounded-lg border border-admin-border bg-white text-[15px] text-ink"
              >
                취소
              </button>
              <button
                onClick={del}
                className="h-[52px] flex-1 rounded-lg bg-admin text-[15px] font-medium text-white"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
