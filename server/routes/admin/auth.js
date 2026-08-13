const Router = require("koa-router");
const adminService = require("../../services/admin");
const { wrap } = require("../shared/handler-wrap");

const router = new Router();

router.post(
  "/login",
  wrap(async ({ username, password }) => {
    return await adminService.login({ username, password });
  })
);

router.post(
  "/refresh",
  wrap(async ({ refreshToken }) => {
    return await adminService.refresh({ refreshToken });
  })
);

router.post(
  "/logout",
  wrap(async ({ refreshToken }) => {
    await adminService.logout({ refreshToken });
    return { message: "로그아웃되었습니다." };
  })
);

module.exports = router;
