const Router = require("koa-router");
const adminService = require("../../services/admin");
const UserError = require("../../utils/UserError");
const {
  setAuthCookies,
  clearAuthCookies,
  getRefreshToken,
} = require("../../utils/auth-cookie");

const router = new Router();

// 토큰은 HttpOnly 쿠키로만 내보낸다 — body 에 담지 않아 JS 가 토큰을 만질 경로 자체를 없앤다.
router.post("/login", async (ctx) => {
  const result = await adminService.login(ctx.request.body);
  setAuthCookies(ctx, "admin", result);
  ctx.body = { code: 200, admin: result.admin };
});

router.post("/refresh", async (ctx) => {
  const refreshToken = getRefreshToken(ctx, "admin");
  if (!refreshToken) throw new UserError("인증이 필요합니다.", 401);

  const result = await adminService.refresh({ refreshToken });
  setAuthCookies(ctx, "admin", result);
  ctx.body = { code: 200, admin: result.admin };
});

router.post("/logout", async (ctx) => {
  const refreshToken = getRefreshToken(ctx, "admin");
  // Redis 폐기가 실패하더라도 쿠키는 정리한다 — 클라이언트를 로그인 상태로 남기지 않는다.
  if (refreshToken) await adminService.logout({ refreshToken });
  clearAuthCookies(ctx, "admin");
  ctx.body = { code: 200, message: "로그아웃되었습니다." };
});

module.exports = router;
