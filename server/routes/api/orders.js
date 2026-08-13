const Router = require("koa-router");
const orderService = require("../../services/order");
const rateLimit = require("../../middlewares/rate-limit");
const { wrap } = require("../shared/handler-wrap");

const router = new Router();

// FlexTV 계정 검증을 그대로 프록시하므로, 회원 단위로 시도 횟수를 제한해
// ssumpay 계정을 FlexTV 크리덴셜 대입 오라클로 악용하는 걸 막는다.
const memberLimiter = rateLimit({
  windowMs: 600_000,
  max: 10,
  message: "주문 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  keyBy: (ctx) => `order:member:${ctx.state.member.id}`,
});

router.post(
  "/",
  memberLimiter,
  wrap(async ({ caller, productId, flexUsername, flexPassword, paymentMethod = 1 }, ctx) => {
    const order = await orderService.createOrder({
      memberId: caller,
      productId,
      flexUsername,
      flexPassword,
      paymentMethod,
      ipAddr: ctx.ip,
    });
    return { orderNo: order.orderNo, id: order.id, price: order.price };
  })
);

router.get(
  "/my",
  wrap(async ({ caller, page = 1, limit = 10 }) => {
    const { items, total } = await orderService.listMyOrders(caller, { page, limit });
    return { items, total, page: Number(page), limit: Number(limit) };
  })
);

router.get(
  "/:orderNo",
  wrap(async ({ caller, orderNo }) => {
    return await orderService.getByOrderNoForMember(orderNo, caller);
  })
);

module.exports = router;
