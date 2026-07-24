const Router = require("koa-router");
const axios = require("axios");
const Order = require("../../entities/Order");
const Product = require("../../entities/Product");

const FLEXTV_API_URL = process.env.FLEXTV_API_URL;

async function verifyFlexAccount(loginId, password) {
  if (!FLEXTV_API_URL) throw Object.assign(new Error("FlexTV 서비스 연결 설정이 없습니다."), { status: 503 });
  try {
    // FlexTV 웹이 실제로 쓰는 signin 엔드포인트. 성공 시 200 + 회원정보, 실패 시 401.
    const res = await axios.post(`${FLEXTV_API_URL}/v2/api/auth/signin`, {
      loginId,
      password,
      loginKeep: false,
      saveId: false,
      device: "PCWEB",
    });
    return res.status === 200 && !!res.data?.id;
  } catch (e) {
    const status = e.response?.status;
    if (status === 400 || status === 401) return false;
    console.error("[verifyFlexAccount] FlexTV signin failed:", status, e.response?.data ?? e.message);
    throw Object.assign(new Error("FlexTV 계정 확인 중 오류가 발생했습니다."), { status: 502 });
  }
}

const router = new Router();

router.post("/", async (ctx) => {
  const { productId, flexUsername, flexPassword, paymentMethod = 1 } = ctx.request.body;
  const memberId = ctx.state.member.id;

  if (!productId || !flexUsername || !flexPassword) {
    ctx.status = 400;
    ctx.body = { code: 400, message: "상품, FlexTV 아이디, 비밀번호를 입력해주세요." };
    return;
  }

  const isValid = await verifyFlexAccount(flexUsername, flexPassword).catch((e) => {
    ctx.status = e.status || 502;
    ctx.body = { code: e.status || 502, message: e.message };
    return null;
  });
  if (isValid === null) return;
  if (!isValid) {
    ctx.status = 401;
    ctx.body = { code: 401, message: "FlexTV 아이디 또는 비밀번호가 올바르지 않습니다." };
    return;
  }

  const product = await Product.query()
    .findById(productId)
    .where({ isActive: 1 });
  if (!product) {
    ctx.status = 404;
    ctx.body = { code: 404, message: "상품을 찾을 수 없습니다." };
    return;
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const orderNo = `SP${datePart}${Math.floor(Math.random() * 9000) + 1000}`;

  const order = await Order.query().insertAndFetch({
    orderNo,
    memberId,
    productId: product.id,
    productName: product.name,
    price: product.price,
    flexUsername,
    paymentMethod,
    paymentStatus: 0,
    chargeStatus: 0,
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
  const offset = (page - 1) * limit;
  const memberId = ctx.state.member.id;

  const [items, total] = await Promise.all([
    Order.query()
      .where({ memberId })
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset),
    Order.query().where({ memberId }).resultSize(),
  ]);

  ctx.body = {
    code: 200,
    data: items,
    total,
    page: Number(page),
    limit: Number(limit),
  };
});

router.get("/:orderNo", async (ctx) => {
  const order = await Order.query()
    .findOne({ orderNo: ctx.params.orderNo, memberId: ctx.state.member.id })
    .withGraphJoined("product");

  if (!order) {
    ctx.status = 404;
    ctx.body = { code: 404, message: "주문을 찾을 수 없습니다." };
    return;
  }

  ctx.body = { code: 200, data: order };
});

module.exports = router;
