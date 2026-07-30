const Router = require("koa-router");
const adminService = require("../../services/admin");

const router = new Router();

router.post("/login", async (ctx) => {
  const result = await adminService.login(ctx.request.body);
  ctx.body = { code: 200, ...result };
});

router.post("/refresh", async (ctx) => {
  const result = await adminService.refresh(ctx.request.body);
  ctx.body = { code: 200, ...result };
});

router.post("/logout", async (ctx) => {
  await adminService.logout(ctx.request.body);
  ctx.body = { code: 200, message: "로그아웃되었습니다." };
});

module.exports = router;
