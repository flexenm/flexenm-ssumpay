const Router = require("koa-router");
const orderService = require("../../services/order");
const { wrap } = require("../shared/handler-wrap");

const router = new Router();

// 카드 표준결제창 파라미터 발급. 암호화·해시 생성은 서버에서만 한다.
router.post(
  "/ready",
  wrap(async ({ caller, orderNo }) => {
    return await orderService.preparePaymentForMember(orderNo, caller);
  })
);

module.exports = router;
