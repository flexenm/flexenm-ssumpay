const Router = require("koa-router");
const Member = require("../../entities/Member");

const router = new Router();

// 현재 로그인 사용자 정보 (토큰 유효성 확인 창구).
// 인증은 상위 라우터(routes/api/index.js)의 전역 userAuth 가 처리하므로 여기서는 미들웨어를 붙이지 않는다.
router.get("/profile", async (ctx) => {
  const member = await Member.query().findById(ctx.state.member.id);
  // 토큰은 유효하지만 계정이 삭제/차단된 경우도 미인증으로 처리
  if (!member || member.status === 1) {
    ctx.status = 401;
    ctx.body = { code: 401, message: "인증이 필요합니다." };
    return;
  }

  ctx.body = {
    code: 200,
    member: {
      id: member.id,
      username: member.username,
      name: member.name,
      email: member.email,
    },
  };
});

module.exports = router;
