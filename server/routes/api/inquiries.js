const Router = require("koa-router");
const multer = require("@koa/multer");
const Inquiry = require("../../entities/Inquiry");
const { uploadInquiryImage } = require("../../utils/storage");
const UserError = require("../../utils/UserError");

const TITLE_MAX = 50;
const CONTENT_MAX = 1000;

function validateInquiryText(title, content) {
  if (!title || title.length > TITLE_MAX)
    return `제목은 1~${TITLE_MAX}자 이내로 작성해주세요.`;
  if (!content || content.length > CONTENT_MAX)
    return `내용은 1~${CONTENT_MAX}자 이내로 작성해주세요.`;
  return null;
}

const upload = multer({ storage: multer.memoryStorage() });

const router = new Router();

router.get("/", async (ctx) => {
  const { page = 1, limit = 10 } = ctx.query;
  const offset = (page - 1) * limit;
  const memberId = ctx.state.member.id;

  const [items, total] = await Promise.all([
    Inquiry.query()
      .where({ memberId })
      .whereNull("deletedAt")
      .select("id", "type", "title", "status", "createdAt", "answeredAt")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset),
    Inquiry.query().where({ memberId }).whereNull("deletedAt").resultSize(),
  ]);

  ctx.body = {
    code: 200,
    data: items,
    total,
    page: Number(page),
    limit: Number(limit),
  };
});

router.get("/:id", async (ctx) => {
  const inquiry = await Inquiry.query()
    .findById(ctx.params.id)
    .where({ memberId: ctx.state.member.id })
    .whereNull("deletedAt");

  if (!inquiry) {
    throw new UserError("문의를 찾을 수 없습니다.", 404);
  }
  ctx.body = { code: 200, data: inquiry };
});

router.post("/", upload.fields([{ name: "image", maxCount: 1 }]), async (ctx) => {
  const { type, title, content } = ctx.request.body;
  if (type === undefined || type === null || type === "" || !title || !content) {
    throw new UserError("문의 유형, 제목, 내용을 입력해주세요.", 400);
  }

  const textError = validateInquiryText(title, content);
  if (textError) {
    throw new UserError(textError, 400);
  }

  const imageFile = ctx.files?.image?.[0] ?? null;
  const imageUrl = imageFile ? await uploadInquiryImage(imageFile.buffer) : null;

  const inquiry = await Inquiry.query().insertAndFetch({
    memberId: ctx.state.member.id,
    type,
    title,
    content,
    imageUrl,
    status: 0,
  });

  ctx.status = 201;
  ctx.body = { code: 201, data: inquiry };
});

router.put("/:id", upload.fields([{ name: "image", maxCount: 1 }]), async (ctx) => {
  const inquiry = await Inquiry.query()
    .findById(ctx.params.id)
    .where({ memberId: ctx.state.member.id })
    .whereNull("deletedAt");

  if (!inquiry) {
    throw new UserError("문의를 찾을 수 없습니다.", 404);
  }
  if (inquiry.status !== 0) {
    throw new UserError("답변이 완료된 문의는 수정할 수 없습니다.", 403);
  }

  const { title, content } = ctx.request.body;
  if (!title || !content) {
    throw new UserError("제목과 내용을 입력해주세요.", 400);
  }

  const textError = validateInquiryText(title, content);
  if (textError) {
    throw new UserError(textError, 400);
  }

  const patch = { title, content };

  const imageFile = ctx.files?.image?.[0] ?? null;
  if (imageFile) {
    patch.imageUrl = await uploadInquiryImage(imageFile.buffer);
  }

  const updated = await Inquiry.query().patchAndFetchById(inquiry.id, patch);
  ctx.body = { code: 200, data: updated };
});

router.delete("/:id", async (ctx) => {
  const inquiry = await Inquiry.query()
    .findById(ctx.params.id)
    .where({ memberId: ctx.state.member.id })
    .whereNull("deletedAt");

  if (!inquiry) {
    throw new UserError("문의를 찾을 수 없습니다.", 404);
  }
  if (inquiry.status !== 0) {
    throw new UserError("답변이 완료된 문의는 삭제할 수 없습니다.", 403);
  }

  await Inquiry.query().findById(inquiry.id).patch({
    deletedAt: new Date().toISOString(),
  });
  ctx.body = { code: 200, message: "문의가 삭제되었습니다." };
});

module.exports = router;
