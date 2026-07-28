const Router = require("koa-router");
const multer = require("@koa/multer");
const inquiryService = require("../../services/inquiry");

const upload = multer({ storage: multer.memoryStorage() });

const router = new Router();

router.get("/", async (ctx) => {
  const { page = 1, limit = 10 } = ctx.query;
  const { items, total } = await inquiryService.listByMember(ctx.state.member.id, { page, limit });
  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) };
});

router.get("/:id", async (ctx) => {
  const inquiry = await inquiryService.getByIdForMember(ctx.params.id, ctx.state.member.id);
  ctx.body = { code: 200, data: inquiry };
});

router.post("/", upload.fields([{ name: "image", maxCount: 1 }]), async (ctx) => {
  const { type, title, content } = ctx.request.body;
  const imageBuffer = ctx.files?.image?.[0]?.buffer ?? null;

  const inquiry = await inquiryService.createInquiry({
    memberId: ctx.state.member.id,
    type,
    title,
    content,
    imageBuffer,
  });

  ctx.status = 201;
  ctx.body = { code: 201, data: inquiry };
});

router.put("/:id", upload.fields([{ name: "image", maxCount: 1 }]), async (ctx) => {
  const { title, content } = ctx.request.body;
  const imageBuffer = ctx.files?.image?.[0]?.buffer ?? null;

  const updated = await inquiryService.updateInquiry(ctx.params.id, ctx.state.member.id, {
    title,
    content,
    imageBuffer,
  });

  ctx.body = { code: 200, data: updated };
});

router.delete("/:id", async (ctx) => {
  await inquiryService.deleteInquiry(ctx.params.id, ctx.state.member.id);
  ctx.body = { code: 200, message: "문의가 삭제되었습니다." };
});

module.exports = router;
