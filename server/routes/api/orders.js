const Router = require("koa-router");
const orderService = require("../../services/order");

const router = new Router();

router.post("/", async (ctx) => {
  const { productId, flexUsername, flexPassword, paymentMethod = 1 } = ctx.request.body;

  const order = await orderService.createOrder({
    memberId: ctx.state.member.id,
    productId,
    flexUsername,
    flexPassword,
    paymentMethod,
    ipAddr: ctx.ip,
  });

  ctx.status = 201;
  ctx.body = {
    code: 201,
    data: { orderNo: order.orderNo, id: order.id, price: order.price },
  };
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
