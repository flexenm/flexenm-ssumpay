const Router = require("koa-router");
const userAuth = require("../../middlewares/user-auth");

const authRouter = require("./auth");
const productsRouter = require("./products");
const noticesRouter = require("./notices");
const myRouter = require("./my");
const mypageRouter = require("./mypage");
const ordersRouter = require("./orders");
const paymentsRouter = require("./payments");
const inquiriesRouter = require("./inquiries");

const router = new Router({ prefix: "/api" });

// 공개 라우트 (인증 불필요)
router.use("/auth", authRouter.routes());
router.use("/products", productsRouter.routes());
router.use("/notices", noticesRouter.routes());

// 이하 라우트는 등록 순서가 아니라 각 마운트에 userAuth를 명시적으로 부착해서 인증한다.
// (등록 순서에만 의존하면 나중에 새 라우트를 실수로 위쪽에 추가할 때 조용히 인증이 빠질 수 있음)
router.use("/my", userAuth, myRouter.routes());
router.use("/mypage", userAuth, mypageRouter.routes());
router.use("/orders", userAuth, ordersRouter.routes());
router.use("/payments", userAuth, paymentsRouter.routes());
router.use("/inquiries", userAuth, inquiriesRouter.routes());

module.exports = router;
