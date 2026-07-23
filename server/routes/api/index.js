const Router = require("koa-router");
const userAuth = require("../../middlewares/user-auth");

const authRouter = require("./auth");
const productsRouter = require("./products");
const noticesRouter = require("./notices");
const myRouter = require("./my");
const mypageRouter = require("./mypage");
const ordersRouter = require("./orders");
const inquiriesRouter = require("./inquiries");

const router = new Router({ prefix: "/api" });

// 공개 라우트 (인증 불필요)
router.use("/auth", authRouter.routes());
router.use("/products", productsRouter.routes());
router.use("/notices", noticesRouter.routes());

// 이하 모든 라우트는 사용자 JWT 필요 (admin 라우터와 동일 패턴)
router.use(userAuth);
router.use("/my", myRouter.routes());
router.use("/mypage", mypageRouter.routes());
router.use("/orders", ordersRouter.routes());
router.use("/inquiries", inquiriesRouter.routes());

module.exports = router;
