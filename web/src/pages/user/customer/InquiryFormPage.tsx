import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { inquiriesApi } from '../../../api'
import type { CreateInquiryInput } from '../../../api'

export default function InquiryFormPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<{ type: '' | number; title: string; content: string }>({ type: '', title: '', content: '' })
  const typeSelected = form.type !== ''
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!typeSelected || !form.title || !form.content) { setError('모든 항목을 입력해주세요.'); return }
    try {
      await inquiriesApi.create(form as CreateInquiryInput)
      alert('문의가 등록되었습니다.')
      navigate('/customer')
    } catch (err) {
      setError((err as { message?: string })?.message || '문의 등록에 실패했습니다.')
    }
  }

  return (
    <div className="mx-auto max-w-[800px] px-6 py-10">
      <p className="mb-2 text-[13px] text-slate-400">홈 &gt; 고객센터 &gt; 1:1문의</p>
      <h1 className="mb-10 text-center text-[32px] font-bold">고객센터</h1>
      <h2 className="mb-4 border-b border-gray-200 pb-4 text-xl font-bold">1:1 문의 작성</h2>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
          <label className={labelClass}>문의 유형 *</label>
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: Number(e.target.value) }))} className={inputClass}>
            <option value="">문의 유형 선택 (충전/결제/취소·환불/기타)</option>
            <option value={1}>충전</option>
            <option value={2}>결제</option>
            <option value={3}>취소·환불</option>
            <option value={4}>기타</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>제목 *</label>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="제목을 입력해주세요" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>문의 내용 *</label>
          <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            placeholder="문의 내용을 입력해 주세요.&#10;충전 관련 문의 시 주문번호와 플렉스티비 아이디를 함께 적어주시면 빠른 처리가 가능합니다."
            rows={8} className={`${inputClass} resize-y`} />
        </div>
        {error && <p className="text-[13px] text-red-500">{error}</p>}
        <div className="flex justify-center gap-4">
          <button type="button" onClick={() => navigate(-1)} className="cursor-pointer rounded-lg border border-gray-200 bg-white px-10 py-3 text-[15px]">취소</button>
          <button type="submit" className="cursor-pointer rounded-lg border-none bg-blue-600 px-10 py-3 text-[15px] font-semibold text-white">등록하기</button>
        </div>
      </form>
    </div>
  )
}

const labelClass = 'mb-2 block text-sm font-semibold'
const inputClass = 'box-border w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none'
