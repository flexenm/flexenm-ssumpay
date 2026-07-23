import { useState, useEffect, useRef } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { adminProductsApi } from "@/api";
import type { Product } from "@/types";

interface ProductFormState {
  id?: number;
  name: string;
  price: number | string;
  lexAmount: number | string;
  sort: number | string;
  isActive: 0 | 1;
  imageUrl?: string;
  category?: string;
  subcategory?: string;
  coinAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  _imageFile?: File;
}

const empty: ProductFormState = { name: "", price: "", lexAmount: "", sort: "", isActive: 1, imageUrl: "" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState<ProductFormState>(empty);
  const [selected, setSelected] = useState<Product | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const revokePreview = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const load = () => {
    setLoading(true);
    return adminProductsApi
      .list()
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => () => revokePreview(), []);

  const openCreate = () => {
    revokePreview();
    setForm(empty);
    setPreview(null);
    setModal("create");
  };
  const openEdit = (p: Product) => {
    revokePreview();
    setForm(p);
    setPreview((p as ProductFormState).imageUrl || null);
    setSelected(p);
    setModal("edit");
  };
  const openDelete = (p: Product) => {
    setSelected(p);
    setModal("delete");
  };

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    if (!file) return;
    revokePreview();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreview(url);
    setForm((p) => ({ ...p, _imageFile: file }));
  };

  const save = async () => {
    const data = {
      ...form,
      price: Number(form.price),
      lexAmount: Number(form.lexAmount),
      sort: Number(form.sort),
      coinAmount: 0,
      category: form.category || "broadcast",
      subcategory: form.subcategory || "플렉스",
    };
    delete data._imageFile;
    try {
      if (modal === "create") await adminProductsApi.create(data);
      else await adminProductsApi.update(selected!.id, data);
      revokePreview();
      setModal(null);
      load();
    } catch (e) {
      alert((e as { message?: string })?.message || "저장 중 오류가 발생했습니다.");
    }
  };

  const del = async () => {
    try {
      await adminProductsApi.delete(selected!.id);
      setModal(null);
      load();
    } catch (e) {
      alert((e as { message?: string })?.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">상품 관리</h1>
        <button
          onClick={openCreate}
          className="w-[200px] h-[52px] bg-admin text-white rounded-lg cursor-pointer text-[15px] font-medium"
        >
          + 상품 등록
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="h-[52px] bg-admin-head">
            {["상품명", "렉스 수량", "판매가", "노출 여부", "정렬 순서", "관리"].map((h) => (
              <th key={h} className="px-4 text-left text-[14px] font-medium text-admin-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="p-10 text-center text-[14px] text-admin-muted">
                불러오는 중...
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-10 text-center text-[14px] text-admin-muted">
                상품이 없습니다.
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id} className="h-[52px] border-b border-admin-line">
                <td className={tdClass}>{p.name}</td>
                <td className={tdClass}>{p.lexAmount?.toLocaleString()}</td>
                <td className={tdClass}>{p.price?.toLocaleString()}원</td>
                <td className={tdClass}>{p.isActive ? "ON" : "OFF"}</td>
                <td className={tdClass}>{p.sort}</td>
                <td className={tdClass}>
                  <button onClick={() => openEdit(p)} className="text-ink hover:underline cursor-pointer">
                    수정
                  </button>
                  <span className="mx-1.5 text-admin-muted">·</span>
                  <button onClick={() => openDelete(p)} className="text-ink hover:underline cursor-pointer">
                    삭제
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-4 space-y-1 text-[14px] text-admin-muted">
        <p>※ 등록/수정은 모달: 상품명 + 렉스 수량 + 판매가 + 노출 여부 입력</p>
        <p>※ 노출 OFF 상품은 사용자 상품 목록에서 숨김 처리</p>
      </div>

      {(modal === "create" || modal === "edit") && (
        <ProductModal
          title={modal === "create" ? "상품 등록" : "상품 수정"}
          form={form}
          setForm={setForm}
          preview={preview}
          onImage={handleImage}
          onRemoveImage={() => {
            revokePreview();
            setPreview(null);
            setForm((p) => ({ ...p, imageUrl: "" }));
          }}
          isEdit={modal === "edit"}
          onClose={() => {
            revokePreview();
            setModal(null);
          }}
          onConfirm={save}
        />
      )}

      {modal === "delete" && (
        <div className={overlayClass}>
          <div className="bg-white rounded-2xl w-[467px] px-10 pt-10 pb-8">
            <p className="text-[18px] font-bold text-center text-ink mb-4">상품을 삭제하시겠습니까?</p>
            <p className="text-[15px] text-admin-muted text-center leading-[1.7] mb-4">
              삭제 시 사용자 상품 목록에서 즉시 제거됩니다.
              <br />
              기존 주문 내역은 유지됩니다.
            </p>
            <p className="text-[13px] text-admin-muted text-center mb-8">
              ※ 판매 이력이 있는 상품은 삭제보다 노출 OFF 권장
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className={cancelBtnClass}>
                취소
              </button>
              <button onClick={del} className={confirmBtnClass}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductModalProps {
  title: string;
  form: ProductFormState;
  setForm: Dispatch<SetStateAction<ProductFormState>>;
  preview: string | null;
  onImage: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  isEdit: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function ProductModal({ title, form, setForm, preview, onImage, onRemoveImage, isEdit, onClose, onConfirm }: ProductModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className={overlayClass}>
      <div className="bg-white rounded-2xl w-[720px] max-h-[90vh] overflow-y-auto p-10">
        <h3 className="text-[22px] font-bold text-center text-ink mb-8">{title}</h3>

        {/* 이미지 */}
        <div className="mb-6">
          <label className={labelClass}>상품 이미지</label>
          <div className="flex items-start gap-4">
            <div className="w-[110px] h-[110px] rounded-lg border border-admin-border bg-admin-head flex items-center justify-center text-[14px] text-admin-muted overflow-hidden shrink-0">
              {preview ? <img src={preview} className="w-full h-full object-cover" /> : isEdit ? "등록됨" : "이미지"}
            </div>
            <div>
              <div className="flex gap-2 mb-2">
                <button onClick={() => fileRef.current?.click()} className={imageBtnClass}>
                  {isEdit ? "이미지 변경" : "이미지 업로드"}
                </button>
                {isEdit && preview && (
                  <button onClick={onRemoveImage} className={imageBtnClass}>
                    삭제
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png" onChange={onImage} className="hidden" />
              <p className="text-[13px] text-admin-muted leading-[1.6]">
                권장 1:1 비율 · 500×500px 이상 · jpg/png · 최대 5MB
                <br />
                미등록 시 기본 렉스 아이콘으로 표시
              </p>
            </div>
          </div>
        </div>

        {/* 상품명 */}
        <div className="mb-5">
          <label className={labelClass}>상품명 *</label>
          <input
            value={form.name ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="예) 플렉스티비 렉스 100개"
            className={inputClass}
          />
        </div>

        {/* 렉스 수량 + 판매가 */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className={labelClass}>렉스 수량 *</label>
            <input
              type="number"
              value={form.lexAmount ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, lexAmount: e.target.value }))}
              placeholder="숫자만 입력"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>판매가(원) *</label>
            <input
              type="number"
              value={form.price ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="숫자만 입력"
              className={inputClass}
            />
          </div>
        </div>

        {/* 노출 여부 + 정렬 순서 */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className={labelClass}>노출 여부</label>
            <div className="flex gap-2">
              {[
                { v: 1, label: "ON" },
                { v: 0, label: "OFF" },
              ].map(({ v, label }) => (
                <button
                  key={v}
                  onClick={() => setForm((p) => ({ ...p, isActive: v as 0 | 1 }))}
                  className={`w-[76px] h-[44px] rounded-lg text-[15px] font-medium cursor-pointer ${
                    form.isActive === v ? "bg-admin text-white" : "bg-white border border-admin-border text-admin-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>정렬 순서</label>
            <input
              type="number"
              value={form.sort ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, sort: e.target.value }))}
              placeholder="예) 1"
              className={inputClass}
            />
          </div>
        </div>

        <p className="text-[13px] text-admin-muted leading-[1.6] mb-8">
          {isEdit ? (
            <>
              ※ 이미지·가격 등 수정 내용은 저장 즉시 사용자 화면에 반영
              <br />※ 기존 주문 내역의 상품 정보는 변경되지 않음
            </>
          ) : (
            "※ 등록 즉시 사용자 상품 목록에 노출됩니다. (노출 ON 기준)"
          )}
        </p>

        <div className="flex gap-3">
          <button onClick={onClose} className={cancelBtnClass}>
            취소
          </button>
          <button onClick={onConfirm} className={confirmBtnClass}>
            {isEdit ? "저장" : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayClass =
  "fixed inset-0 z-[100] flex items-center justify-center bg-black/40";
const tdClass = "px-4 text-[14px] text-ink";
const labelClass = "block text-[15px] font-medium text-ink mb-2";
const inputClass =
  "h-[52px] w-full rounded-lg border border-admin-border bg-admin-bg px-4 text-[15px] text-ink placeholder:text-[#a6a6a6] outline-none box-border";
const imageBtnClass = "h-[40px] px-4 rounded-lg border border-admin-border bg-white text-ink text-[14px] cursor-pointer";
const cancelBtnClass = "flex-1 h-[56px] rounded-lg border border-admin-border bg-white text-ink text-[15px] font-medium cursor-pointer";
const confirmBtnClass = "flex-1 h-[56px] rounded-lg bg-admin text-white text-[15px] font-medium cursor-pointer";
