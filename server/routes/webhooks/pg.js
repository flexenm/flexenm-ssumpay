const Router = require('koa-router')
const orderService = require('../../services/order')
const PaymentGateway = require('../../services/payment')

// 헥토파이낸셜 노티(결과통보) 수신. form-urlencoded 평문 + pktHash 검증.
// 응답 규약: 성공 시 plain text 'OK'(대문자, 공백 없음) — 그 외 응답은 헥토가 재전송한다.
// 사용자 세션이 없으므로 userAuth 대신 해시 검증이 신뢰 경계다.
const router = new Router({ prefix: '/webhooks/pg' })

router.post('/payment', async (ctx) => {
  const body = ctx.request.body || {}
  const { method, outStatCd, bizType, mchtTrdNo, trdNo, trdAmt, cardApprNo } = body

  if (!mchtTrdNo) {
    ctx.body = 'FAIL'
    return
  }

  // 취소 노티 — 취소는 API 응답으로 이미 확정했으므로 수신만 확인하고 무시한다.
  // (취소용 주문번호는 CNCL 접두어로 생성 — services/payment/cancelPayment 참고)
  if (mchtTrdNo.startsWith('CNCL')) {
    ctx.body = 'OK'
    return
  }

  if (!PaymentGateway.verifyWebhookSignature(ctx)) {
    console.error(`[hecto-noti] 해시 검증 실패 mchtTrdNo=${mchtTrdNo} trdNo=${trdNo}`)
    ctx.body = 'FAIL'
    return
  }

  try {
    let ok = true
    if (method === 'CA' && bizType === 'B0' && outStatCd === '0021') {
      // 카드 승인 — 최종 확정
      ok = await orderService.confirmWebhookPayment({
        orderNo: mchtTrdNo,
        amount: Number(trdAmt),
        transactionId: trdNo,
        pgTid: cardApprNo
      })
    } else if (method === 'VA' && outStatCd === '0051') {
      // 가상계좌 채번 — 계좌 정보를 노티 기준으로 갱신 (채번 API 응답과 중복돼도 멱등)
      ok = await orderService.attachVirtualAccountFromNoti({
        orderNo: mchtTrdNo,
        accountNo: body.vtlAcntNo,
        bankName: body.fnNm,
        expireDt: body.expireDt
      })
    } else if (method === 'VA' && outStatCd === '0021') {
      // 가상계좌 입금 — 최종 확정
      ok = await orderService.confirmWebhookPayment({
        orderNo: mchtTrdNo,
        amount: Number(trdAmt),
        transactionId: trdNo
      })
    } else {
      // 그 외(실패 통보 등) — 상태 변경 없이 기록만 남긴다.
      console.log(`[hecto-noti] 미처리 노티 method=${method} bizType=${bizType} outStatCd=${outStatCd} mchtTrdNo=${mchtTrdNo}`)
    }
    // 주문 없음·금액 불일치는 FAIL로 응답해 헥토가 재전송하게 한다 (flextv-webtoon과 동일한 규약).
    ctx.body = ok ? 'OK' : 'FAIL'
  } catch (err) {
    console.error('[hecto-noti] 처리 실패:', err)
    ctx.body = 'FAIL' // 헥토가 재전송하도록
  }
})

module.exports = router
