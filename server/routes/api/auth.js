const Router = require("koa-router");
const rateLimit = require("../../middlewares/rate-limit");
const authService = require("../../services/auth");
const UserError = require("../../utils/UserError");
const {
  setAuthCookies,
  clearAuthCookies,
  getRefreshToken,
} = require("../../utils/auth-cookie");
const { wrap } = require("../shared/handler-wrap");

const router = new Router();

const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
});

// refresh 는 자격증명 추측 대상이 아니다 — 토큰이 256비트 난수라 시도 횟수로 뚫리지 않는다.
// 반대로 프론트가 갱신을 붙이면서 정상 세션이 상시 지나가는 경로가 됐다. 키가 ip:path 라
// 공유 egress(사무실 NAT·모바일 캐리어) 뒤에서는 여러 사용자의 갱신이 한 버킷에 쌓이고,
// 429 를 인터셉터가 갱신 실패로 처리해 그 IP 전체가 동시에 로그아웃된다. 그래서 로그인보다 넉넉히 잡는다.
const refreshLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
});

// 아이디 중복확인
router.get(
  "/check-username",
  authLimiter,
  wrap(async ({ username }) => {
    const available = await authService.checkUsernameAvailable(username);
    return { available };
  }),
);

router.post(
  "/register",
  authLimiter,
  wrap(async ({ username, password, name, email, phone }) => {
    await authService.register({ username, password, name, email, phone });
    return { message: "회원가입이 완료되었습니다." };
  }),
);

// 토큰은 HttpOnly 쿠키로만 내보낸다 — body 에 담지 않아 JS 가 토큰을 만질 경로 자체를 없앤다.
// wrap 이 핸들러 2번째 인자로 ctx 를 넘겨주므로 쿠키 설정은 wrap 안에서 그대로 할 수 있다.
router.post(
  "/login",
  authLimiter,
  wrap(async ({ username, password }, ctx) => {
    const result = await authService.login({ username, password });
    setAuthCookies(ctx, "member", result);
    return { member: result.member };
  }),
);

// refresh token 은 body 가 아니라 HttpOnly 쿠키에서 읽는다.
router.post(
  "/refresh",
  refreshLimiter,
  wrap(async (_params, ctx) => {
    const refreshToken = getRefreshToken(ctx, "member");
    if (!refreshToken) throw new UserError("인증이 필요합니다.", 401);

    const result = await authService.refresh({ refreshToken });
    setAuthCookies(ctx, "member", result);
    return { member: result.member };
  }),
);

router.post(
  "/logout",
  authLimiter,
  wrap(async (_params, ctx) => {
    const refreshToken = getRefreshToken(ctx, "member");
    // Redis 폐기가 실패하더라도 쿠키는 정리한다 — 클라이언트를 로그인 상태로 남기지 않는다.
    if (refreshToken) await authService.logout({ refreshToken });
    clearAuthCookies(ctx, "member");
    return { message: "로그아웃되었습니다." };
  }),
);

// 비밀번호 재설정 링크 요청
router.post(
  "/password/reset",
  authLimiter,
  wrap(async ({ username, email }) => {
    await authService.requestPasswordReset({ username, email });
    return {
      message: "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.",
    };
  }),
);

// 재설정 링크의 토큰으로 새 비밀번호 설정
router.post(
  "/password/reset/confirm",
  authLimiter,
  wrap(async ({ token, newPassword }) => {
    await authService.confirmPasswordReset({ token, newPassword });
    return {
      message: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.",
    };
  }),
);

module.exports = router;
