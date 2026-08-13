const Router = require("koa-router");
const memberService = require("../../services/member");
const { wrap } = require("../shared/handler-wrap");

const router = new Router();

// 현재 로그인 사용자 정보 (토큰 유효성 확인 창구).
// 인증은 상위 라우터(routes/api/index.js)의 전역 userAuth 가 처리하므로 여기서는 미들웨어를 붙이지 않는다.
router.get(
  "/profile",
  wrap(async ({ caller }) => {
    const member = await memberService.getSelf(caller);
    return { member };
  })
);

module.exports = router;
