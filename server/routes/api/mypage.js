const Router = require("koa-router");
const memberService = require("../../services/member");

const router = new Router();

router.get("/", async (ctx) => {
  const member = await memberService.getProfile(ctx.state.member.id);
  ctx.body = { code: 200, data: member };
});

router.patch("/", async (ctx) => {
  const updated = await memberService.updateProfile(ctx.state.member.id, ctx.request.body);
  ctx.body = { code: 200, data: updated };
});

router.patch("/password", async (ctx) => {
  await memberService.changePassword(ctx.state.member.id, ctx.request.body);
  ctx.body = { code: 200, message: "비밀번호가 변경되었습니다." };
});

module.exports = router;
