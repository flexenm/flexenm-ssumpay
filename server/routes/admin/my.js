const Router = require("koa-router");
const Admin = require("../../entities/Admin");
const UserError = require("../../utils/UserError");

const router = new Router();

// 현재 로그인 관리자 정보 (토큰 유효성 확인 창구).
// 인증은 상위 라우터(routes/admin/index.js)의 전역 adminAuth 가 처리하므로 여기서는 미들웨어를 붙이지 않는다.
router.get("/profile", async (ctx) => {
  const admin = await Admin.query().findById(ctx.state.admin.id);
  // 토큰은 유효하지만 계정이 삭제/비활성화된 경우도 미인증으로 처리
  if (!admin || !admin.isActive) {
    throw new UserError("인증이 필요합니다.", 401);
  }

  ctx.body = {
    code: 200,
    admin: { id: admin.id, username: admin.username, name: admin.name },
  };
});

module.exports = router;
