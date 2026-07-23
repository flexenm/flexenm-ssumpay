const Router = require("koa-router");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ms = require("ms");
const Admin = require("../../entities/Admin");
const ipWhitelist = require("../../middlewares/ip-whitelist");

const router = new Router();

router.post("/login", ipWhitelist, async (ctx) => {
  const { username, password } = ctx.request.body;

  if (!username || !password) {
    ctx.status = 400;
    ctx.body = { code: 400, message: "아이디와 비밀번호를 입력해주세요." };
    return;
  }

  const admin = await Admin.query().findOne({ username, isActive: 1 });
  if (!admin) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    };
    return;
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    };
    return;
  }

  const adminJwtExpiresIn = "8h";
  const token = jwt.sign(
    { id: admin.id, username: admin.username, name: admin.name },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: adminJwtExpiresIn },
  );

  ctx.body = {
    code: 200,
    token,
    expiresIn: Math.floor(ms(adminJwtExpiresIn) / 1000), // 쿠키 maxAge 동기화용(초). JWT exp와 동일 원천
    admin: { id: admin.id, username: admin.username, name: admin.name },
  };
});

module.exports = router;
