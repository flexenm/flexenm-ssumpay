import { useParams, useNavigate } from 'react-router-dom'
import { Check, Info } from 'lucide-react'

export default function OrderCompletePage() {
  const { orderNo } = useParams<{ orderNo: string }>()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-[700px] px-6 py-20 text-center">
      <div className="mx-auto mb-6 flex h-[100px] w-[100px] items-center justify-center rounded-full bg-blue-50">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
          <Check size={36} color="#fff" strokeWidth={3} />
        </div>
      </div>
      <h1 className="mb-2 text-[28px] font-bold">결제가 완료되었습니다</h1>
      <p className="mb-12 text-slate-400">이용해주셔서 감사합니다</p>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 text-left">
        <p className="mb-3 font-bold">주문 상품</p>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 font-bold text-white">F</div>
            <div>
              <p className="font-semibold">주문번호: {orderNo}</p>
              <p className="text-[13px] text-slate-400">수량: 1개</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-blue-50 p-4">
          <Info size={18} color="#2563eb" className="mt-px shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#1e40af]">결제 완료 후 최대 30분 내 처리됩니다</p>
            <p className="text-[13px] text-slate-500">렉스 충전은 결제 완료 후 최대 30분 내 처리됩니다. 충전이 지연될 경우 고객센터로 문의해 주세요.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={() => navigate('/mypage')} className="cursor-pointer rounded-lg border-2 border-slate-800 bg-white px-8 py-3 font-semibold">구매 내역 보기</button>
        <button onClick={() => navigate('/')} className="cursor-pointer rounded-lg border-none bg-slate-800 px-8 py-3 font-semibold text-white">홈으로</button>
      </div>
    </div>
  )
}
