const Router = require("koa-router");
const inquiryService = require("../../services/inquiry");
const { wrap } = require("../shared/handler-wrap");

const router = new Router();

router.get(
  "/",
  wrap(async ({ page = 1, limit = 20, status, type }) => {
    const { items, total } = await inquiryService.listForAdmin({ page, limit, status, type });
    return { items, total, page: Number(page), limit: Number(limit) };
  })
);

router.get(
  "/:id",
  wrap(async ({ id }) => {
    return await inquiryService.getByIdForAdmin(id);
  })
);

router.post(
  "/:id/answer",
  wrap(async ({ id, answer }) => {
    await inquiryService.answerInquiry(id, answer);
    return { message: "답변이 등록되었습니다." };
  })
);

module.exports = router;
