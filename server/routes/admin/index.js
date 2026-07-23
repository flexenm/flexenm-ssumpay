const Router = require("koa-router");
const adminAuth = require("../../middlewares/admin-auth");

const authRouter = require("./auth");
const myRouter = require("./my");
const dashboardRouter = require("./dashboard");
const ordersRouter = require("./orders");
const productsRouter = require("./products");
const membersRouter = require("./members");
const noticesRouter = require("./notices");
const inquiriesRouter = require("./inquiries");

const router = new Router({ prefix: "/admin" });

// 로그인은 인증 없이
router.use("/auth", authRouter.routes());

// 이하 모든 라우트는 관리자 JWT 필요
router.use(adminAuth);
router.use("/my", myRouter.routes());
router.use("/dashboard", dashboardRouter.routes());
router.use("/orders", ordersRouter.routes());
router.use("/products", productsRouter.routes());
router.use("/members", membersRouter.routes());
router.use("/notices", noticesRouter.routes());
router.use("/inquiries", inquiriesRouter.routes());

module.exports = router;
