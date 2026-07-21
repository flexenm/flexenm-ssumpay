import { useState, useEffect } from 'react'
import { adminNoticesApi } from '../../../api'

const empty = { title: '', content: '', isPinned: false, isActive: 1 }

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [selected, setSelected] = useState(null)

  const load = () => { setLoading(true); return adminNoticesApi.list().then(r => setNotices(r.data)).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(empty); setModal('create') }
  const openEdit = (n) => { setForm(n); setSelected(n); setModal('edit') }
  const openView = (n) => { setSelected(n); setModal('view') }
  const openDelete = (n) => { setSelected(n); setModal('delete') }

  const save = async () => {
    try {
      if (modal === 'create') await adminNoticesApi.create(form)
      else await adminNoticesApi.update(selected.id, form)
      setModal(null); load()
    } catch (e) {
      alert(e?.message || '저장 중 오류가 발생했습니다.')
    }
  }

  const del = async () => {
    try {
      await adminNoticesApi.delete(selected.id)
      setModal(null); load()
    } catch (e) {
      alert(e?.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>공지사항 관리</h1>
        <button onClick={openCreate} style={btnStyle}>+ 공지 등록</button>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc' }}>
            {['고정', '제목', '상태', '조회수', '등록일', '관리'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>불러오는 중...</td></tr>
              : notices.length === 0
              ? <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>공지사항이 없습니다.</td></tr>
              : notices.map(n => (
                <tr key={n.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{n.isPinned ? '📌' : ''}</td>
                  <td style={{ ...tdStyle, cursor: 'pointer', color: '#2563eb' }} onClick={() => openView(n)}>{n.title}</td>
                  <td style={tdStyle}><span style={{ padding: '3px 10px', borderRadius: 10, background: n.isActive ? '#dcfce7' : '#f1f5f9', color: n.isActive ? '#16a34a' : '#94a3b8', fontSize: 12 }}>{n.isActive ? '공개' : '비공개'}</span></td>
                  <td style={tdStyle}>{n.viewCount}</td>
                  <td style={tdStyle}>{new Date(n.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <button onClick={() => openEdit(n)} style={{ marginRight: 6, padding: '4px 10px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>수정</button>
                    <button onClick={() => openDelete(n)} style={{ padding: '4px 10px', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontSize: 12, background: '#fff' }}>삭제</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <div style={overlay}>
          <div style={card}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{modal === 'create' ? '공지 등록' : '공지 수정'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>제목</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>내용</label>
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={6} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={form.isPinned} onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))} />고정
                </label>
                <select value={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: Number(e.target.value) }))} style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                  <option value={1}>공개</option>
                  <option value={0}>비공개</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button onClick={() => setModal(null)} style={{ padding: '10px 24px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}>취소</button>
              <button onClick={save} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>저장</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'view' && selected && (
        <div style={overlay}>
          <div style={{ ...card, width: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{selected.title}</h3>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>{new Date(selected.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, minHeight: 120, lineHeight: 1.8 }}>{selected.content}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button onClick={() => setModal(null)} style={{ padding: '10px 24px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}>닫기</button>
              <button onClick={() => openEdit(selected)} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>수정</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'delete' && selected && (
        <div style={overlay}>
          <div style={{ ...card, width: 400, textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>공지를 삭제하시겠습니까?</p>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>삭제된 공지는 복구할 수 없습니다.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', background: '#fff' }}>취소</button>
              <button onClick={del} style={{ flex: 1, padding: '12px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const btnStyle = { padding: '10px 20px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }
const tdStyle = { padding: '12px 16px', fontSize: 13 }
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }
const card = { background: '#fff', borderRadius: 16, padding: 32, width: 480, maxHeight: '80vh', overflow: 'auto' }
