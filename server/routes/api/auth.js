const Router = require("koa-router");
const rateLimit = require("../../middlewares/rate-limit");
const authService = require("../../services/auth");
const { wrap } = require("../shared/handler-wrap");

const router = new Router();

const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
});

// 아이디 중복확인
router.get(
  "/check-username",
  authLimiter,
  wrap(async ({ username }) => {
    const available = await authService.checkUsernameAvailable(username);
    return { available };
  })
);

router.post(
  "/register",
  authLimiter,
  wrap(async ({ username, password, name, email, phone }) => {
    await authService.register({ username, password, name, email, phone });
    return { message: "회원가입이 완료되었습니다." };
  })
);

router.post(
  "/login",
  authLimiter,
  wrap(async ({ username, password }) => {
    return await authService.login({ username, password });
  })
);

router.post(
  "/refresh",
  authLimiter,
  wrap(async ({ refreshToken }) => {
    return await authService.refresh({ refreshToken });
  })
);

router.post(
  "/logout",
  authLimiter,
  wrap(async ({ refreshToken }) => {
    await authService.logout({ refreshToken });
    return { message: "로그아웃되었습니다." };
  })
);

// 비밀번호 재설정 링크 요청
router.post(
  "/password/reset",
  authLimiter,
  wrap(async ({ username, email }) => {
    await authService.requestPasswordReset({ username, email });
    return { message: "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다." };
  })
);

// 재설정 링크의 토큰으로 새 비밀번호 설정
router.post(
  "/password/reset/confirm",
  authLimiter,
  wrap(async ({ token, newPassword }) => {
    await authService.confirmPasswordReset({ token, newPassword });
    return { message: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요." };
  })
);

module.exports = router;
