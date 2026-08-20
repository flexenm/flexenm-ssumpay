const axios = require('axios')
const crypto = require('crypto')
const db = require('../../db')
const OrdersRepo = require('../../repositories/Orders')
const ProductsRepo = require('../../repositories/Products')
const PaymentGateway = require('../payment')
const FlexTVService = require('../flextv')
const UserError = require('../../utils/UserError')
const { PAYMENT_METHOD, CHARGE_STATUS, PAYMENT_STATUS } = require('../../const')

const FLEXTV_API_URL = process.env.FLEXTV_API_URL

async function verifyFlexAccount(loginId, password) {
  if (!FLEXTV_API_URL) throw Object.assign(new Error('FlexTV 서비스 연결 설정이 없습니다.'), { status: 503 })
  try {
    // FlexTV 웹이 실제로 쓰는 signin 엔드포인트. 성공 시 200 + 회원정보, 실패 시 401.
    const res = await axios.post(`${FLEXTV_API_URL}/v2/api/auth/signin`, {
      loginId,
      password,
      loginKeep: false,
      saveId: false,
      device: 'PCWEB'
    }, { timeout: 5000 })
    return res.status === 200 && !!res.data?.id
  } catch (e) {
    const status = e.response?.status
    if (status === 400 || status === 401) return false
    console.error('[verifyFlexAccount] FlexTV signin failed:', status, e.response?.data ?? e.message)
    throw Object.assign(new Error('FlexTV 계정 확인 중 오류가 발생했습니다.'), { status: 502 })
  }
}

// 주문번호: SP + yyyyMMddHHmmss + 회원ID + 랜덤 6자(대문자 영숫자).
// 회원ID가 들어가 서로 다른 회원끼리는 충돌이 불가능하고, 같은 회원이 같은 초에 주문해도
// 36^6(≈22억) 조합의 랜덤이 겹쳐야 하므로 중복 재시도 없이 단일 insert로 충분하다.
// 최대 길이 2+14+10(INT UNSIGNED 최대)+6 = 32 — orderNo VARCHAR(40) 이내 (013 마이그레이션).
function generateOrderNo(memberId) {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const rand = crypto.randomBytes(4).readUInt32BE(0).toString(36).toUpperCase().padStart(6, '0').slice(-6)
  return `SP${datePart}${memberId}${rand}`
}

async function createOrder({ memberId, productId, flexUsername, flexPassword, paymentMethod, payerName, ipAddr }) {
  if (!Object.values(PAYMENT_METHOD).includes(paymentMethod)) {
    throw new UserError('올바르지 않은 결제 수단입니다.', 400)
  }

  if (!productId || !flexUsername || !flexPassword) {
    throw new UserError('상품, FlexTV 아이디, 비밀번호를 입력해주세요.', 400)
  }

  if (paymentMethod === PAYMENT_METHOD.BANK && !payerName) {
    throw new UserError('입금자명을 입력해주세요.', 400)
  }

  const isValid = await verifyFlexAccount(flexUsername, flexPassword)
  if (!isValid) {
    throw new UserError('FlexTV 아이디 또는 비밀번호가 올바르지 않습니다.', 401)
  }

  const product = await ProductsRepo.findActiveByIdAndNotDeleted(productId)
  if (!product) {
    throw new UserError('상품을 찾을 수 없습니다.', 404)
  }

  const orderData = {
    memberId,
    productId: product.id,
    productName: product.name,
    price: product.price,
    flexUsername,
    paymentMethod,
    payerName: paymentMethod === PAYMENT_METHOD.BANK ? payerName : null,
    paymentStatus: 0,
    chargeStatus: 0,
    ipAddr
  }

  const order = await OrdersRepo.insert({ ...orderData, orderNo: generateOrderNo(memberId) })

  if (paymentMethod === PAYMENT_METHOD.BANK) {
    const account = await PaymentGateway.issueVirtualAccount({
      orderNo: order.orderNo,
      amount: order.price,
      productName: order.productName,
      payerName: order.payerName
    })
    await OrdersRepo.attachVirtualAccount(order.orderNo, {
      virtualAccountNo: account.accountNo,
      virtualAccountBank: account.bankName,
      virtualAccountExpiredAt: account.expiredAt
    })
    order.virtualAccountNo = account.accountNo
    order.virtualAccountBank = account.bankName
    order.virtualAccountExpiredAt = account.expiredAt
  }

  return order
}

// 카드 결제창 파라미터 준비. 주문 소유자만, 결제 대기 상태에서만 허용한다.
async function preparePaymentForMember(orderNo, memberId) {
  const order = await OrdersRepo.findByOrderNoForMember(orderNo, memberId)
  if (!order) {
    throw new UserError('주문을 찾을 수 없습니다.', 404)
  }
  if (order.paymentStatus !== PAYMENT_STATUS.PENDING) {
    throw new UserError('결제 대기 상태의 주문이 아닙니다.', 400)
  }
  if (order.paymentMethod !== PAYMENT_METHOD.CARD) {
    throw new UserError('카드 결제 주문만 결제창을 사용할 수 있습니다.', 400)
  }
  return PaymentGateway.preparePayment({ order })
}

// 카드결제 확인 — 클라이언트가 보낸 paymentKey를 그대로 믿지 않고 PG 서버 승인 API로 재확인한다.
async function confirmPayment(orderNo, memberId, { paymentKey, amount }) {
  const order = await OrdersRepo.findByOrderNoForMember(orderNo, memberId)
  if (!order) {
    throw new UserError('주문을 찾을 수 없습니다.', 404)
  }

  if (order.paymentStatus === PAYMENT_STATUS.DONE) {
    return order
  }

  const result = await PaymentGateway.approvePayment({ paymentKey, orderNo, amount })
  if (result.amount !== order.price) {
    console.error(`[confirmPayment] amount mismatch orderNo=${orderNo} expected=${order.price} actual=${result.amount}`)
    throw new UserError('결제 금액이 일치하지 않습니다.', 400)
  }

  await OrdersRepo.markPaymentDone(orderNo, { pgTid: result.transactionId })
  return OrdersRepo.findByOrderNoForMember(orderNo, memberId)
}

// PG 웹훅(카드 승인·가상계좌 입금) 처리 — 라우트에서 해시 검증을 마친 뒤에만 호출된다.
// 성공(이미 완료 포함) 시 true — 라우트가 이 값으로 노티 응답(OK/FAIL)을 결정한다.
async function confirmWebhookPayment({ orderNo, amount, transactionId, pgTid, payerName }) {
  const order = await OrdersRepo.findByOrderNo(orderNo)
  if (!order) {
    console.error(`[confirmWebhookPayment] order not found orderNo=${orderNo}`)
    return false
  }

  if (order.paymentStatus === PAYMENT_STATUS.DONE) {
    return true
  }

  if (amount !== order.price) {
    console.error(`[confirmWebhookPayment] amount mismatch orderNo=${orderNo} expected=${order.price} actual=${amount}`)
    return false
  }

  // 헥토 가상계좌는 주문별 1회용 채번이라 계좌 자체가 주문을 특정한다.
  // 입금자명 대조는 노티가 입금자명을 제공하는 경우에만 수행한다.
  if (order.paymentMethod === PAYMENT_METHOD.BANK && payerName != null && payerName !== order.payerName) {
    console.error(`[confirmWebhookPayment] payer name mismatch orderNo=${orderNo} expected=${order.payerName} actual=${payerName}`)
    return false
  }

  await OrdersRepo.markPaymentDone(orderNo, { pgTrxNo: transactionId, pgTid })
  return true
}

// 가상계좌 채번 노티(0051) 반영. 채번 API 응답으로 이미 저장돼 있어도 노티 기준으로 덮어쓴다(멱등).
async function attachVirtualAccountFromNoti({ orderNo, accountNo, bankName, expireDt }) {
  const order = await OrdersRepo.findByOrderNo(orderNo)
  if (!order) {
    console.error(`[attachVirtualAccountFromNoti] order not found orderNo=${orderNo}`)
    return false
  }
  const s = expireDt && String(expireDt).length === 14 ? String(expireDt) : null
  await OrdersRepo.attachVirtualAccount(orderNo, {
    virtualAccountNo: accountNo,
    virtualAccountBank: bankName,
    virtualAccountExpiredAt: s
      ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}`
      : null
  })
  return true
}

// 무통장입금 웹훅이 안 오는 등 예외 상황에서 관리자가 입금을 직접 확인하고 승인하는 경로.
// 카드결제는 confirmPayment(PG 서버 승인)로만 확정되도록 하고, 이 수동 승인은 무통장에 한정한다.
async function confirmPaymentManually(id, adminId, { memo } = {}) {
  const order = await OrdersRepo.findById(id)
  if (!order) {
    throw new UserError('주문을 찾을 수 없습니다.', 404)
  }

  if (order.paymentMethod !== PAYMENT_METHOD.BANK) {
    throw new UserError('무통장입금 주문만 수동으로 확인할 수 있습니다.', 400)
  }

  if (order.paymentStatus === PAYMENT_STATUS.DONE) {
    throw new UserError('이미 결제 완료 처리된 주문입니다.', 400)
  }

  if (!memo || typeof memo !== 'string') {
    throw new UserError('수동 확인 사유(메모)를 입력해주세요.', 400)
  }

  // pgTrxNo에 'manual:' 접두어를 남겨 PG가 실제로 확인한 건과 관리자가 수동 승인한 건을 구분할 수 있게 한다.
  await OrdersRepo.markPaymentDone(order.orderNo, { pgTrxNo: `manual:admin${adminId}` })

  const note = `[관리자 수동 결제확인 #admin${adminId} ${new Date().toISOString()}] ${memo}`
  await OrdersRepo.patchMemo(id, order.memo ? `${order.memo}\n${note}` : note)
}

// 관리자 결제 취소. 카드·결제완료 건은 헥토 승인취소 API를 먼저 성공시켜야 상태를 바꾼다.
async function cancelPaymentByAdmin(id) {
  const order = await OrdersRepo.findById(id)
  if (!order) {
    throw new UserError('주문을 찾을 수 없습니다.', 404)
  }
  if (order.paymentStatus === PAYMENT_STATUS.CANCELLED) {
    throw new UserError('이미 취소된 주문입니다.', 400)
  }
  if (order.chargeStatus === CHARGE_STATUS.DONE) {
    throw new UserError('충전 완료된 주문은 취소할 수 없습니다. 환불 절차로 처리해주세요.', 400)
  }

  if (order.paymentStatus === PAYMENT_STATUS.DONE) {
    if (order.paymentMethod === PAYMENT_METHOD.BANK) {
      throw new UserError('가상계좌 입금 완료 건은 수동 환불 후 메모와 함께 처리해주세요.', 400)
    }
    // 카드 승인취소 — PG 취소가 성공해야만 상태를 바꾼다 (실패 시 그대로 에러 전파)
    await PaymentGateway.cancelPayment({ orderNo: order.orderNo, pgTrxNo: order.pgTrxNo, amount: order.price })
    await OrdersRepo.markPaymentCancelled(order.id, PAYMENT_STATUS.DONE)
    return
  }

  // 결제 전(PENDING) — PG 호출 없이 주문만 취소. 가상계좌는 입금기한 만료로 자연 소멸된다.
  await OrdersRepo.markPaymentCancelled(order.id, PAYMENT_STATUS.PENDING)
}

async function listMyOrders(memberId, { page, limit }) {
  return OrdersRepo.listByMember(memberId, { page, limit })
}

async function getByOrderNoForMember(orderNo, memberId) {
  const order = await OrdersRepo.findByOrderNoForMember(orderNo, memberId)
  if (!order) {
    throw new UserError('주문을 찾을 수 없습니다.', 404)
  }
  return order
}

async function searchForAdmin(filters) {
  return OrdersRepo.searchForAdmin(filters)
}

async function getByIdForAdmin(id) {
  const order = await OrdersRepo.findByIdWithMemberAndProduct(id)
  if (!order) {
    throw new UserError('주문을 찾을 수 없습니다.', 404)
  }
  return order
}

async function updateChargeStatus(id, { chargeStatus, memo }) {
  const order = await OrdersRepo.findByIdWithMemberAndProduct(id)
  if (!order) {
    throw new UserError('주문을 찾을 수 없습니다.', 404)
  }

  if (![0, 1, 2].includes(Number(chargeStatus))) {
    throw new UserError('유효하지 않은 충전 상태입니다.', 400)
  }

  if ([CHARGE_STATUS.DONE, CHARGE_STATUS.REFUNDED].includes(Number(chargeStatus))) {
    if (order.paymentStatus !== PAYMENT_STATUS.DONE) {
      throw new UserError('결제가 완료된 주문만 충전 상태를 변경할 수 있습니다.', 400)
    }
  }

  if (order.chargeStatus === CHARGE_STATUS.REFUNDED) {
    throw new UserError('환불 완료된 주문은 상태를 변경할 수 없습니다.', 400)
  }

  if (memo !== undefined && typeof memo !== 'string') {
    throw new UserError('메모는 문자열이어야 합니다.', 400)
  }

  const updates = { chargeStatus: Number(chargeStatus) }

  // 실패 시 여기서 에러가 그대로 던져지므로 아래 patchChargeStatus는 실행되지 않고
  // chargeStatus는 이전 값(대기)으로 유지된다 — "완료 처리는 됐는데 실제 지급은 실패"를 방지.
  if (Number(chargeStatus) === CHARGE_STATUS.DONE) {
    const result = await FlexTVService.chargeLex({
      loginId: order.flexUsername,
      lexAmount: order.product.lexAmount,
      orderNo: order.orderNo,
      productName: order.productName,
      memo
    })
    updates.chargedAt = db.raw('NOW()')
    updates.flexPaymentId = result.paymentId
  }
  if (memo !== undefined) updates.memo = memo

  await OrdersRepo.patchChargeStatus(id, updates)
}

async function updateMemo(id, memo) {
  if (typeof memo !== 'string') {
    throw new UserError('메모는 문자열이어야 합니다.', 400)
  }

  const order = await OrdersRepo.findById(id)
  if (!order) {
    throw new UserError('주문을 찾을 수 없습니다.', 404)
  }

  await OrdersRepo.patchMemo(id, memo)
}

module.exports = {
  createOrder,
  preparePaymentForMember,
  confirmPayment,
  confirmWebhookPayment,
  attachVirtualAccountFromNoti,
  confirmPaymentManually,
  cancelPaymentByAdmin,
  listMyOrders,
  getByOrderNoForMember,
  searchForAdmin,
  getByIdForAdmin,
  updateChargeStatus,
  updateMemo
}
