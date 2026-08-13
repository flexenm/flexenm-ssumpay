const jwt = require("jsonwebtoken");
const Admin = require("../entities/Admin");
const UserError = require("../utils/UserError");
const { getAccessToken } = require("../utils/auth-cookie");

module.exports = async function adminAuth(ctx, next) {
  // HttpOnly 쿠키가 기본 경로. Authorization 헤더는 폴백 (user-auth.js 주석 참조)
  const token =
    getAccessToken(ctx, "admin") ||
    ctx.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    throw new UserError("인증이 필요합니다.", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
  } catch (e) {
    throw new UserError("유효하지 않은 토큰입니다.", 401);
  }

  const admin = await Admin.query()
    .findById(decoded.id)
    .select("id", "isActive");

  if (!admin || !admin.isActive) {
    throw new UserError("인증이 필요합니다.", 401);
  }

  ctx.state.admin = { id: admin.id, isActive: admin.isActive };
  await next();
};
