const Router = require("koa-router");
const inquiryService = require("../../services/inquiry");

const router = new Router();

router.get("/", async (ctx) => {
  const { page = 1, limit = 20, status, type } = ctx.query;
  const { items, total } = await inquiryService.listForAdmin({ page, limit, status, type });
  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) };
});

router.get("/:id", async (ctx) => {
  const inquiry = await inquiryService.getByIdForAdmin(ctx.params.id);
  ctx.body = { code: 200, data: inquiry };
});

router.post("/:id/answer", async (ctx) => {
  await inquiryService.answerInquiry(ctx.params.id, ctx.request.body.answer);
  ctx.body = { code: 200, message: "답변이 등록되었습니다." };
});

module.exports = router;
