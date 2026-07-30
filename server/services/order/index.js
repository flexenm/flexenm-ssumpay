const axios = require('axios')
const db = require('../../db')
const OrdersRepo = require('../../repositories/Orders')
const ProductsRepo = require('../../repositories/Products')
const PaymentGateway = require('../payment')
const FlexTVService = require('../flextv')
const UserError = require('../../utils/UserError')
const { PAYMENT_METHOD, CHARGE_STATUS, PAYMENT_STATUS } = require('../../const')

const FLEXTV_API_URL = process.env.FLEXTV_API_URL
const ORDER_NO_MAX_RETRIES = 3

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

function generateOrderNo() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `SP${datePart}${Math.floor(Math.random() * 9000) + 1000}`
}

async function createOrder({ memberId, productId, flexUsername, flexPassword, paymentMethod = 1, ipAddr }) {
  if (!Object.values(PAYMENT_METHOD).includes(paymentMethod)) {
    throw new UserError('올바르지 않은 결제 수단입니다.', 400)
  }

  if (!productId || !flexUsername || !flexPassword) {
    throw new UserError('상품, FlexTV 아이디, 비밀번호를 입력해주세요.', 400)
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
    paymentStatus: 0,
    chargeStatus: 0,
    ipAddr
  }

  // orderNo는 초당 9000개 조합의 랜덤 접미사라 동시 주문 시 충돌 가능 — ER_DUP_ENTRY면 새 orderNo로 재시도.
  // 여기까지 왔다는 건 FlexTV 인증이 이미 끝났다는 뜻이라, 그 비용을 버리지 않도록 insert만 재시도한다.
  let order
  for (let attempt = 0; attempt < ORDER_NO_MAX_RETRIES; attempt++) {
    try {
      order = await OrdersRepo.insert({ ...orderData, orderNo: generateOrderNo() })
      break
    } catch (err) {
      if (err.code !== 'ER_DUP_ENTRY' || attempt === ORDER_NO_MAX_RETRIES - 1) throw err
    }
  }

  if (paymentMethod === PAYMENT_METHOD.BANK) {
    const account = await PaymentGateway.issueVirtualAccount({ orderNo: order.orderNo, amount: order.price })
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

// PG 웹훅(무통장입금 확인) 처리 — 라우트에서 서명 검증을 마친 뒤에만 호출된다.
async function confirmWebhookPayment({ orderNo, amount, transactionId }) {
  const order = await OrdersRepo.findByOrderNo(orderNo)
  if (!order) {
    console.error(`[confirmWebhookPayment] order not found orderNo=${orderNo}`)
    return
  }

  if (order.paymentStatus === PAYMENT_STATUS.DONE) {
    return
  }

  if (amount !== order.price) {
    console.error(`[confirmWebhookPayment] amount mismatch orderNo=${orderNo} expected=${order.price} actual=${amount}`)
    return
  }

  await OrdersRepo.markPaymentDone(orderNo, { pgTrxNo: transactionId })
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
  confirmPayment,
  confirmWebhookPayment,
  listMyOrders,
  getByOrderNoForMember,
  searchForAdmin,
  getByIdForAdmin,
  updateChargeStatus,
  updateMemo
}
