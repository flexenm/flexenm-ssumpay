const Router = require("koa-router");
const bcrypt = require("bcrypt");
const Member = require("../../entities/Member");
const { validatePassword, validateName } = require("../../utils/validators");

const router = new Router();

router.get("/", async (ctx) => {
  const member = await Member.query()
    .findById(ctx.state.member.id)
    .select(
      "id",
      "username",
      "name",
      "email",
      "phone",
      "flexUsername",
      "createdAt",
    );

  ctx.body = { code: 200, data: member };
});

router.patch("/", async (ctx) => {
  const { phone, flexUsername } = ctx.request.body;
  const name =
    typeof ctx.request.body.name === "string"
      ? ctx.request.body.name.trim()
      : ctx.request.body.name;

  // 이름을 변경하는 경우 회원가입과 동일한 규칙 적용
  if (name) {
    const nameError = validateName(name);
    if (nameError) {
      ctx.status = 400;
      ctx.body = { code: 400, message: nameError };
      return;
    }
  }

  const updated = await Member.query().patchAndFetchById(ctx.state.member.id, {
    ...(name && { name }),
    ...(phone !== undefined && { phone }),
    ...(flexUsername !== undefined && { flexUsername }),
  });

  ctx.body = {
    code: 200,
    data: {
      id: updated.id,
      username: updated.username,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      flexUsername: updated.flexUsername,
    },
  };
});

router.patch("/password", async (ctx) => {
  const { currentPassword, newPassword } = ctx.request.body;

  if (!currentPassword || !newPassword) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: "현재 비밀번호와 새 비밀번호를 입력해주세요.",
    };
    return;
  }

  const pwError = validatePassword(newPassword);
  if (pwError) {
    ctx.status = 400;
    ctx.body = { code: 400, message: pwError };
    return;
  }

  const member = await Member.query().findById(ctx.state.member.id);
  const isValid = await bcrypt.compare(currentPassword, member.password);
  if (!isValid) {
    ctx.status = 401;
    ctx.body = { code: 401, message: "현재 비밀번호가 올바르지 않습니다." };
    return;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await Member.query().patchAndFetchById(member.id, { password: hashed });

  ctx.body = { code: 200, message: "비밀번호가 변경되었습니다." };
});

module.exports = router;
