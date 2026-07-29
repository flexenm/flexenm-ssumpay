const Router = require("koa-router");
const adminAuth = require("../../middlewares/admin-auth");
const ipWhitelist = require("../../middlewares/ip-whitelist");

const authRouter = require("./auth");
const myRouter = require("./my");
const dashboardRouter = require("./dashboard");
const ordersRouter = require("./orders");
const productsRouter = require("./products");
const membersRouter = require("./members");
const noticesRouter = require("./notices");
const inquiriesRouter = require("./inquiries");

const router = new Router({ prefix: "/admin" });

router.use(ipWhitelist);

// 로그인은 인증 없이
router.use("/auth", authRouter.routes());

// 이하 라우트는 등록 순서가 아니라 각 마운트에 adminAuth를 명시적으로 부착해서 인증한다.
// (등록 순서에만 의존하면 나중에 새 라우트를 실수로 위쪽에 추가할 때 조용히 인증이 빠질 수 있음)
router.use("/my", adminAuth, myRouter.routes());
router.use("/dashboard", adminAuth, dashboardRouter.routes());
router.use("/orders", adminAuth, ordersRouter.routes());
router.use("/products", adminAuth, productsRouter.routes());
router.use("/members", adminAuth, membersRouter.routes());
router.use("/notices", adminAuth, noticesRouter.routes());
router.use("/inquiries", adminAuth, inquiriesRouter.routes());

module.exports = router;
