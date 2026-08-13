const Router = require("koa-router");
const multer = require("@koa/multer");
const inquiryService = require("../../services/inquiry");
const UserError = require("../../utils/UserError");
const { ALLOWED_MIME, MAX_SIZE } = require("../../utils/storage");
const { wrap } = require("../shared/handler-wrap");

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

router.get(
  "/",
  wrap(async ({ caller, page = 1, limit = 10 }) => {
    const { items, total } = await inquiryService.listByMember(caller, { page, limit });
    return { items, total, page: Number(page), limit: Number(limit) };
  })
);

router.get(
  "/:id",
  wrap(async ({ caller, id }) => {
    return await inquiryService.getByIdForMember(id, caller);
  })
);

router.post(
  "/",
  withImageUpload,
  wrap(async ({ caller, type, title, content }, ctx) => {
    const imageBuffer = ctx.files?.image?.[0]?.buffer ?? null;
    return await inquiryService.createInquiry({
      memberId: caller,
      type,
      title,
      content,
      imageBuffer,
    });
  })
);

router.put(
  "/:id",
  withImageUpload,
  wrap(async ({ caller, id, title, content }, ctx) => {
    const imageBuffer = ctx.files?.image?.[0]?.buffer ?? null;
    return await inquiryService.updateInquiry(id, caller, { title, content, imageBuffer });
  })
);

router.delete(
  "/:id",
  wrap(async ({ caller, id }) => {
    await inquiryService.deleteInquiry(id, caller);
    return { message: "문의가 삭제되었습니다." };
  })
);

module.exports = router;
