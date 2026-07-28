const Router = require("koa-router");
const adminService = require("../../services/admin");

const router = new Router();

router.post("/login", async (ctx) => {
  const result = await adminService.login(ctx.request.body);
  ctx.body = { code: 200, ...result };
});

module.exports = router;
