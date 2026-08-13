const Router = require("koa-router");
const memberService = require("../../services/member");
const { wrap } = require("../shared/handler-wrap");

const router = new Router();

router.get(
  "/",
  wrap(async ({ caller }) => {
    return await memberService.getProfile(caller);
  })
);

router.patch(
  "/",
  wrap(async ({ caller, name, phone, flexUsername }) => {
    return await memberService.updateProfile(caller, { name, phone, flexUsername });
  })
);

router.patch(
  "/password",
  wrap(async ({ caller, currentPassword, newPassword }) => {
    await memberService.changePassword(caller, { currentPassword, newPassword });
    return { message: "비밀번호가 변경되었습니다." };
  })
);

module.exports = router;
