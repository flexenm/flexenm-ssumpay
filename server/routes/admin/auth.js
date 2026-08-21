const Router = require("koa-router");
const adminService = require("../../services/admin");
const UserError = require("../../utils/UserError");
const {
  setAuthCookies,
  clearAuthCookies,
  getRefreshToken,
} = require("../../utils/auth-cookie");
const { wrap } = require("../shared/handler-wrap");

const router = new Router();

// 토큰은 HttpOnly 쿠키로만 내보낸다 — body 에 담지 않아 JS 가 토큰을 만질 경로 자체를 없앤다.
// wrap 이 핸들러 2번째 인자로 ctx 를 넘겨주므로 쿠키 설정은 wrap 안에서 그대로 할 수 있다.
router.post(
  "/login",
  wrap(async ({ username, password }, ctx) => {
    const result = await adminService.login({ username, password });
    setAuthCookies(ctx, "admin", result);
    return { admin: result.admin };
  }),
);

// refresh token 은 body 가 아니라 HttpOnly 쿠키에서 읽는다.
router.post(
  "/refresh",
  wrap(async (_params, ctx) => {
    const refreshToken = getRefreshToken(ctx, "admin");
    if (!refreshToken) throw new UserError("인증이 필요합니다.", 401);

    const result = await adminService.refresh({ refreshToken });
    setAuthCookies(ctx, "admin", result);
    return { admin: result.admin };
  }),
);

router.post(
  "/logout",
  wrap(async (_params, ctx) => {
    const refreshToken = getRefreshToken(ctx, "admin");
    if (refreshToken) {
      adminService.logout({ refreshToken }).catch((err) => {
        console.error("[ERROR] admin logout revoke failed:", err);
      });
    }
    clearAuthCookies(ctx, "admin");
    return { message: "로그아웃되었습니다." };
  }),
);

module.exports = router;
