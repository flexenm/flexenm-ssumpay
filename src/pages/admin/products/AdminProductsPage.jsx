import { useState, useEffect, useRef } from 'react'
import { adminProductsApi } from '../../../api'

const empty = { name: '', price: '', lexAmount: '', sortOrder: '', isActive: 1, imageUrl: '' }

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(null)
  const objectUrlRef = useRef(null)

  const revokePreview = () => {
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null }
  }

  const load = () => adminProductsApi.list().then(r => setProducts(r.data)).catch(() => {})
  useEffect(() => { load() }, [])
  useEffect(() => () => revokePreview(), [])

  const openCreate = () => { revokePreview(); setForm(empty); setPreview(null); setModal('create') }
  const openEdit = (p) => { revokePreview(); setForm(p); setPreview(p.imageUrl || null); setSelected(p); setModal('edit') }
  const openDelete = (p) => { setSelected(p); setModal('delete') }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    revokePreview()
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setPreview(url)
    setForm(p => ({ ...p, _imageFile: file }))
  }

  const save = async () => {
    const data = {
      ...form,
      price: Number(form.price),
      lexAmount: Number(form.lexAmount),
      sortOrder: Number(form.sortOrder),
      coinAmount: 0,
      category: form.category || 'broadcast',
      subcategory: form.subcategory || '플렉스',
    }
    delete data._imageFile
    try {
      if (modal === 'create') await adminProductsApi.create(data)
      else await adminProductsApi.update(selected.id, data)
      revokePreview()
      setModal(null); load()
    } catch (e) {
      alert(e?.message || '저장 중 오류가 발생했습니다.')
    }
  }

  const del = async () => {
    try {
      await adminProductsApi.delete(selected.id)
      setModal(null); load()
    } catch (e) {
      alert(e?.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>상품 관리</h1>
        <button onClick={openCreate} style={btnStyle}>+ 상품 등록</button>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc' }}>
            {['상품명', '렉스 수량', '판매가', '노출 여부', '정렬 순서', '관리'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {products.length === 0
              ? <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>상품이 없습니다.</td></tr>
              : products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{p.lexAmount}</td>
                  <td style={tdStyle}>{p.price?.toLocaleString()}원</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '3px 10px', borderRadius: 10, background: p.isActive ? '#f0fdf4' : '#fef2f2', color: p.isActive ? '#16a34a' : '#dc2626', fontSize: 12, fontWeight: 600 }}>
                      {p.isActive ? 'ON' : 'OFF'}
                    </span>
                  </td>
                  <td style={tdStyle}>{p.sortOrder}</td>
                  <td style={tdStyle}>
                    <button onClick={() => openEdit(p)} style={{ marginRight: 6, padding: '4px 10px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>수정</button>
                    <button onClick={() => openDelete(p)} style={{ padding: '4px 10px', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontSize: 12, background: '#fff' }}>삭제</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <ProductModal
          title={modal === 'create' ? '상품 등록' : '상품 수정'}
          form={form} setForm={setForm}
          preview={preview} onImage={handleImage}
          onRemoveImage={() => { revokePreview(); setPreview(null); setForm(p => ({ ...p, imageUrl: '' })) }}
          isEdit={modal === 'edit'}
          onClose={() => { revokePreview(); setModal(null) }}
          onConfirm={save}
        />
      )}

      {modal === 'delete' && (
        <div style={overlay}>
          <div style={{ ...modalBox, width: 420, padding: '40px 32px 32px' }}>
            <p style={{ fontWeight: 700, fontSize: 18, textAlign: 'center', marginBottom: 16 }}>상품을 삭제하시겠습니까?</p>
            <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 1.7, marginBottom: 16 }}>
              삭제 시 사용자 상품 목록에서 즉시 제거됩니다.<br />기존 주문 내역은 유지됩니다.
            </p>
            <p style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginBottom: 32 }}>※ 판매 이력이 있는 상품은 삭제보다 노출 OFF 관장</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '14px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', background: '#fff', fontSize: 15 }}>취소</button>
              <button onClick={del} style={{ flex: 1, padding: '14px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductModal({ title, form, setForm, preview, onImage, onRemoveImage, isEdit, onClose, onConfirm }) {
  const fileRef = useRef(null)

  return (
    <div style={overlay}>
      <div style={{ ...modalBox, width: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>{title}</h3>

        {/* 이미지 */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>상품 이미지</label>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 90, height: 90, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13, overflow: 'hidden', flexShrink: 0 }}>
              {preview ? <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (isEdit ? '등록됨' : '이미지')}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button onClick={() => fileRef.current?.click()} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', background: '#fff', fontSize: 13 }}>
                  {isEdit ? '이미지 변경' : '이미지 업로드'}
                </button>
                {isEdit && preview && (
                  <button onClick={onRemoveImage} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', background: '#fff', fontSize: 13 }}>삭제</button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png" onChange={onImage} style={{ display: 'none' }} />
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>권장 1:1 비율 · 500×500px 이상 · jpg/png · 최대 5MB<br />미등록 시 기본 렉스 아이콘으로 표시</p>
            </div>
          </div>
        </div>

        {/* 상품명 */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>상품명 *</label>
          <input value={form.name ?? ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="예) 플렉스티비 렉스 100개" style={inputStyle} />
        </div>

        {/* 렉스 수량 + 판매가 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>렉스 수량 *</label>
            <input type="number" value={form.lexAmount ?? ''} onChange={e => setForm(p => ({ ...p, lexAmount: e.target.value }))}
              placeholder="숫자만 입력" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>판매가(원) *</label>
            <input type="number" value={form.price ?? ''} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              placeholder="숫자만 입력" style={inputStyle} />
          </div>
        </div>

        {/* 노출 여부 + 정렬 순서 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
          <div>
            <label style={labelStyle}>노출 여부</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: 1, label: 'ON' }, { v: 0, label: 'OFF' }].map(({ v, label }) => (
                <button key={v} onClick={() => setForm(p => ({ ...p, isActive: v }))} style={{
                  padding: '10px 24px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  background: form.isActive === v ? '#1e293b' : '#f1f5f9',
                  color: form.isActive === v ? '#fff' : '#64748b'
                }}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>정렬 순서</label>
            <input type="number" value={form.sortOrder ?? ''} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))}
              placeholder="예) 1" style={inputStyle} />
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 32 }}>
          {isEdit
            ? <>※ 이미지·가격 등 수정 내용은 저장 즉시 사용자 화면에 반영<br />※ 기존 주문 내역의 상품 정보는 변경되지 않음</>
            : '※ 등록 즉시 사용자 상품 목록에 노출됩니다. (노출 ON 기준)'}
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', background: '#fff', fontSize: 15 }}>취소</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '14px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
            {isEdit ? '저장' : '등록'}
          </button>
        </div>
      </div>
    </div>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }
const modalBox = { background: '#fff', borderRadius: 16, padding: 32, width: 480 }
const btnStyle = { padding: '10px 20px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }
const tdStyle = { padding: '12px 16px', fontSize: 13 }
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }
