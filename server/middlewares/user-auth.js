const jwt = require("jsonwebtoken");
const Member = require("../entities/Member");
const { MEMBER_STATUS } = require("../const");
const UserError = require("../utils/UserError");
const { getAccessToken } = require("../utils/auth-cookie");

module.exports = async function userAuth(ctx, next) {
  // HttpOnly 쿠키가 기본 경로. Authorization 헤더는 폴백으로 남긴다 —
  // XSS 가 쿠키를 못 읽으면 헤더에 넣을 토큰도 얻지 못하므로 폴백이 보안을 되돌리지 않는다.
  const token =
    getAccessToken(ctx, "member") ||
    ctx.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    throw new UserError("인증이 필요합니다.", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    throw new UserError("유효하지 않은 토큰입니다.", 401);
  }

  const member = await Member.query()
    .findById(decoded.id)
    .select("id", "status");

  if (!member || member.status === MEMBER_STATUS.BLOCKED) {
    throw new UserError("인증이 필요합니다.", 401);
  }

  ctx.state.member = { id: member.id, status: member.status };
  await next();
};
