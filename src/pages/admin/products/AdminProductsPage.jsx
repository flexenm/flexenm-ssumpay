import { useState, useEffect } from 'react'
import { adminProductsApi } from '../../../api'

const empty = { category: '', subcategory: '', name: '', price: '', lexAmount: '', coinAmount: '', sortOrder: 0, isActive: 1 }

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [modal, setModal] = useState(null) // null | 'create' | 'edit' | 'delete'
  const [form, setForm] = useState(empty)
  const [selected, setSelected] = useState(null)

  const load = () => adminProductsApi.list().then(r => setProducts(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(empty); setModal('create') }
  const openEdit = (p) => { setForm(p); setSelected(p); setModal('edit') }
  const openDelete = (p) => { setSelected(p); setModal('delete') }

  const save = async () => {
    const data = { ...form, price: Number(form.price), lexAmount: Number(form.lexAmount), coinAmount: Number(form.coinAmount) }
    if (modal === 'create') await adminProductsApi.create(data)
    else await adminProductsApi.update(selected.id, data)
    setModal(null); load()
  }

  const del = async () => {
    await adminProductsApi.delete(selected.id)
    setModal(null); load()
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
            {['카테고리', '서브카테고리', '상품명', '가격', '렉스', '코인', '순서', '상태', '관리'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {products.length === 0
              ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>상품이 없습니다.</td></tr>
              : products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{p.category}</td>
                  <td style={tdStyle}>{p.subcategory}</td>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{p.price?.toLocaleString()}원</td>
                  <td style={tdStyle}>{p.lexAmount}</td>
                  <td style={tdStyle}>{p.coinAmount}</td>
                  <td style={tdStyle}>{p.sortOrder}</td>
                  <td style={tdStyle}><span style={{ padding: '3px 10px', borderRadius: 10, background: p.isActive ? '#dcfce7' : '#fee2e2', color: p.isActive ? '#16a34a' : '#dc2626', fontSize: 12 }}>{p.isActive ? '활성' : '비활성'}</span></td>
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
        <Modal title={modal === 'create' ? '상품 등록' : '상품 수정'} onClose={() => setModal(null)} onConfirm={save} confirmText="저장">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['category', '카테고리'], ['subcategory', '서브카테고리'], ['name', '상품명'], ['price', '가격'], ['lexAmount', '렉스'], ['coinAmount', '코인']].map(([k, l]) => (
              <div key={k}>
                <label style={labelStyle}>{l}</label>
                <input value={form[k] ?? ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
            <div>
              <label style={labelStyle}>정렬순서</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>상태</label>
              <select value={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: Number(e.target.value) }))} style={inputStyle}>
                <option value={1}>활성</option>
                <option value={0}>비활성</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="상품 삭제" onClose={() => setModal(null)} onConfirm={del} confirmText="삭제" danger>
          <p style={{ textAlign: 'center', padding: '20px 0' }}>상품을 비활성화하시겠습니까?<br /><span style={{ fontWeight: 700 }}>{selected?.name}</span></p>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, children, onClose, onConfirm, confirmText, danger }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 480, maxHeight: '80vh', overflow: 'auto' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>{title}</h3>
        {children}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ padding: '10px 24px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}>취소</button>
          <button onClick={onConfirm} style={{ padding: '10px 24px', background: danger ? '#dc2626' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

const btnStyle = { padding: '10px 20px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }
const tdStyle = { padding: '12px 16px', fontSize: 13 }
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }
