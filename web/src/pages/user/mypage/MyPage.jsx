import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, PenLine } from 'lucide-react'
import { mypageApi, ordersApi, inquiriesApi } from '../../../api'

const tabs = ['내 정보', '구매 내역', '1:1 문의 내역']
const breadcrumbs = ['내정보', '구매내역', '1:1문의내역']

export default function MyPage() {
  const [tab, setTab] = useState(0)
  const [info, setInfo] = useState(null)
  const [orders, setOrders] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    mypageApi.get().then(r => setInfo(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (tab === 1) {
      setLoading(true)
      ordersApi.my().then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false))
    }
    if (tab === 2) {
      setLoading(true)
      inquiriesApi.list().then(r => setInquiries(r.data)).catch(() => {}).finally(() => setLoading(false))
    }
  }, [tab])

  const changePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.newPassword !== pwForm.newPasswordConfirm) {
      setPwError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    try {
      await mypageApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwSuccess('비밀번호가 변경되었습니다.')
      setPwForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
    } catch (err) {
      setPwError(err.message || '비밀번호 변경에 실패했습니다.')
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      {/* Breadcrumb */}
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>
        홈 &gt; 마이페이지 &gt; {breadcrumbs[tab]}
      </p>
      <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>마이페이지</h1>
      <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 40 }}>회원 정보를 관리하고 다양한 서비스를 이용해보세요</p>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 48 }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding: '10px 40px', borderRadius: 24, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
            background: tab === i ? '#2563eb' : '#f1f5f9', color: tab === i ? '#fff' : '#374151'
          }}>{t}</button>
        ))}
      </div>

      {/* 내 정보 */}
      {tab === 0 && info && (
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          {/* 회원 정보 */}
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>회원 정보</h2>
          <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: 32 }}>
            {[['아이디', info.username], ['이메일', info.email]].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ width: 100, color: '#64748b', fontSize: 14 }}>{label}</span>
                <div style={{ flex: 1, padding: '10px 16px', background: '#f8fafc', borderRadius: 8, fontSize: 14, color: '#374151' }}>{value}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12, color: '#94a3b8', fontSize: 13, whiteSpace: 'nowrap' }}>
                  <Lock size={13} /> 변경 불가
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>※ 아이디·이메일은 변경할 수 없습니다.</p>
          </div>

          {/* 비밀번호 변경 */}
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>비밀번호 변경</h2>
          <div style={{ borderTop: '1px solid #e5e7eb' }}>
            <form onSubmit={changePassword}>
              {[
                ['currentPassword', '현재 비밀번호', '현재 비밀번호 입력'],
                ['newPassword', '새 비밀번호', '8자 이상, 영문+숫자+특수문자'],
                ['newPasswordConfirm', '새 비밀번호 확인', '재입력'],
              ].map(([key, label, placeholder]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ width: 120, color: '#64748b', fontSize: 14, flexShrink: 0 }}>{label}</span>
                  <input
                    type="password"
                    value={pwForm[key]}
                    onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ flex: 1, padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: '#f8fafc' }}
                  />
                </div>
              ))}
              {pwError && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{pwError}</p>}
              {pwSuccess && <p style={{ color: '#22c55e', fontSize: 13, marginTop: 8 }}>{pwSuccess}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="submit" style={{ padding: '12px 32px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  비밀번호 변경
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 구매 내역 */}
      {tab === 1 && (
        <div>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: 60 }}>불러오는 중...</p>
          ) : orders.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: 60 }}>구매 내역이 없습니다.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['주문 일시', '주문번호', '상품', '금액', '상태'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>{new Date(o.createdAt).toLocaleString()}</td>
                    <td style={tdStyle}>{o.orderNo}</td>
                    <td style={tdStyle}>{o.productName}</td>
                    <td style={tdStyle}>{o.price?.toLocaleString()}원</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{
                        padding: '5px 14px', borderRadius: 16, fontSize: 13, fontWeight: 600,
                        background: o.chargeStatus === 1 ? '#2563eb' : '#f1f5f9',
                        color: o.chargeStatus === 1 ? '#fff' : '#94a3b8'
                      }}>
                        {o.chargeStatus === 1 ? '충전 완료' : '충전 대기'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 1:1 문의 내역 */}
      {tab === 2 && (
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => navigate('/customer/inquiries/new')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
              <PenLine size={15} /> 문의하기
            </button>
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: 60 }}>불러오는 중...</p>
          ) : inquiries.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: 60 }}>문의 내역이 없습니다.</p>
          ) : (
            inquiries.map(q => (
              <div key={q.id} onClick={() => navigate(`/mypage/inquiries/${q.id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                    background: q.status === 1 ? '#2563eb' : '#f1f5f9',
                    color: q.status === 1 ? '#fff' : '#94a3b8'
                  }}>
                    {q.status === 1 ? '답변 완료' : '답변 대기'}
                  </span>
                  <span style={{ fontSize: 15 }}>{q.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13, flexShrink: 0 }}>
                  {new Date(q.createdAt).toLocaleString()} &gt;
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const tdStyle = { padding: '14px 16px', textAlign: 'center', fontSize: 14 }
