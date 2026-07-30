const Router = require("koa-router");
const orderService = require("../../services/order");
const rateLimit = require("../../middlewares/rate-limit");

const router = new Router();

// FlexTV 계정 검증을 그대로 프록시하므로, 회원 단위로 시도 횟수를 제한해
// ssumpay 계정을 FlexTV 크리덴셜 대입 오라클로 악용하는 걸 막는다.
const memberLimiter = rateLimit({
  windowMs: 600_000,
  max: 10,
  message: "주문 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  keyBy: (ctx) => `order:member:${ctx.state.member.id}`,
});

router.post("/", memberLimiter, async (ctx) => {
  const { productId, flexUsername, flexPassword, paymentMethod = 1, payerName } = ctx.request.body;

  const order = await orderService.createOrder({
    memberId: ctx.state.member.id,
    productId,
    flexUsername,
    flexPassword,
    paymentMethod,
    payerName,
    ipAddr: ctx.ip,
  });

  ctx.status = 201;
  ctx.body = {
    code: 201,
    data: {
      orderNo: order.orderNo,
      id: order.id,
      price: order.price,
      virtualAccountNo: order.virtualAccountNo,
      virtualAccountBank: order.virtualAccountBank,
      virtualAccountExpiredAt: order.virtualAccountExpiredAt,
      payerName: order.payerName,
    },
  };
});

router.post("/:orderNo/payment/confirm", async (ctx) => {
  const { paymentKey, amount } = ctx.request.body;
  const order = await orderService.confirmPayment(ctx.params.orderNo, ctx.state.member.id, { paymentKey, amount });
  ctx.body = { code: 200, data: order };
});

router.get("/my", async (ctx) => {
  const { page = 1, limit = 10 } = ctx.query;
  const { items, total } = await orderService.listMyOrders(ctx.state.member.id, { page, limit });
  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) };
});

router.get("/:orderNo", async (ctx) => {
  const order = await orderService.getByOrderNoForMember(ctx.params.orderNo, ctx.state.member.id);
  ctx.body = { code: 200, data: order };
});

module.exports = router;
