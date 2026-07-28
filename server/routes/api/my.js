const Router = require("koa-router");
const memberService = require("../../services/member");

const router = new Router();

// 현재 로그인 사용자 정보 (토큰 유효성 확인 창구).
// 인증은 상위 라우터(routes/api/index.js)의 전역 userAuth 가 처리하므로 여기서는 미들웨어를 붙이지 않는다.
router.get("/profile", async (ctx) => {
  const member = await memberService.getSelf(ctx.state.member.id);
  ctx.body = { code: 200, member };
});

module.exports = router;
