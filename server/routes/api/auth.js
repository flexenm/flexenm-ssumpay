const Router = require("koa-router");
const rateLimit = require("../../middlewares/rate-limit");
const authService = require("../../services/auth");

const router = new Router();

const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
});

// 아이디 중복확인
router.get("/check-username", authLimiter, async (ctx) => {
  const available = await authService.checkUsernameAvailable(ctx.query.username);
  ctx.body = { code: 200, available };
});

router.post("/register", authLimiter, async (ctx) => {
  await authService.register(ctx.request.body);
  ctx.status = 201;
  ctx.body = { code: 201, message: "회원가입이 완료되었습니다." };
});

router.post("/login", authLimiter, async (ctx) => {
  const result = await authService.login(ctx.request.body);
  ctx.body = { code: 200, ...result };
});

router.post("/refresh", authLimiter, async (ctx) => {
  const result = await authService.refresh(ctx.request.body);
  ctx.body = { code: 200, ...result };
});

router.post("/logout", authLimiter, async (ctx) => {
  await authService.logout(ctx.request.body);
  ctx.body = { code: 200, message: "로그아웃되었습니다." };
});

// 비밀번호 재설정 링크 요청
router.post("/password/reset", authLimiter, async (ctx) => {
  await authService.requestPasswordReset(ctx.request.body);
  ctx.body = {
    code: 200,
    message: "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.",
  };
});

// 재설정 링크의 토큰으로 새 비밀번호 설정
router.post("/password/reset/confirm", authLimiter, async (ctx) => {
  await authService.confirmPasswordReset(ctx.request.body);
  ctx.body = {
    code: 200,
    message: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.",
  };
});

module.exports = router;
