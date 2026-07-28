const Router = require("koa-router");
const multer = require("@koa/multer");
const inquiryService = require("../../services/inquiry");
const UserError = require("../../utils/UserError");
const { ALLOWED_MIME, MAX_SIZE } = require("../../utils/storage");

// 업로드 스트림 단계에서 조기 차단 — storage.js의 검증은 버퍼가 메모리에 다 올라온 뒤 동작한다.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new UserError("JPG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다.", 400));
      return;
    }
    cb(null, true);
  },
});

const uploadImage = upload.fields([{ name: "image", maxCount: 1 }]);

// multer가 던지는 MulterError는 UserError가 아니라 500으로 새어나가므로 400으로 변환한다.
async function withImageUpload(ctx, next) {
  try {
    await uploadImage(ctx, next);
  } catch (err) {
    if (err.name !== "MulterError") throw err;
    if (err.code === "LIMIT_FILE_SIZE") {
      throw new UserError(`이미지 크기는 ${MAX_SIZE / 1024 / 1024}MB 이하여야 합니다.`, 400);
    }
    throw new UserError("이미지 업로드에 실패했습니다.", 400);
  }
}

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

router.post("/", withImageUpload, async (ctx) => {
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

router.put("/:id", withImageUpload, async (ctx) => {
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
