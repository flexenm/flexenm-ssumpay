const Router = require("koa-router");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ms = require("ms");
const crypto = require("crypto");
const Member = require("../../entities/Member");
const PasswordResetToken = require("../../entities/PasswordResetToken");
const rateLimit = require("../../middlewares/rate-limit");
const { createTransport, escapeHtml } = require("../../utils/mailer");

const router = new Router();

const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
});

// 재설정 링크가 가리킬 프론트엔드 주소
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
// 재설정 링크 유효시간 (30분)
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

// 원문 토큰을 그대로 DB에 저장하지 않고 해시로 저장한다.
// DB가 유출되어도 저장된 값만으로는 재설정 링크를 만들 수 없다.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const USERNAME_REGEX = /^(?!(?:[0-9]+)$)[a-zA-Z0-9]{4,16}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~`!?@#$%^&*()\-+=]).{8,}$/;

function validateUsername(username) {
  if (!username) return "아이디를 입력해주세요.";
  if (!USERNAME_REGEX.test(username))
    return "아이디는 4~16자 영문+숫자 조합이어야 합니다. (숫자만 불가)";
  return null;
}

function validatePassword(password) {
  if (!password) return "비밀번호를 입력해주세요.";
  if (!PASSWORD_REGEX.test(password))
    return "비밀번호는 8자 이상, 영문·숫자·특수문자를 각각 1개 이상 포함해야 합니다.";
  return null;
}

// 아이디 중복확인
router.get("/check-username", authLimiter, async (ctx) => {
  const { username } = ctx.query;
  if (!username) {
    ctx.status = 400;
    ctx.body = { code: 400, message: "아이디를 입력해주세요." };
    return;
  }

  const unError = validateUsername(username);
  if (unError) {
    ctx.status = 400;
    ctx.body = { code: 400, message: unError };
    return;
  }

  const exists = await Member.query().findOne({ username });
  ctx.body = { code: 200, available: !exists };
});

router.post("/register", authLimiter, async (ctx) => {
  const { username, password, name, email, phone } = ctx.request.body;

  if (!username || !password || !name || !email) {
    ctx.status = 400;
    ctx.body = { code: 400, message: "필수 항목을 입력해주세요." };
    return;
  }

  const unError = validateUsername(username);
  if (unError) {
    ctx.status = 400;
    ctx.body = { code: 400, message: unError };
    return;
  }

  const pwError = validatePassword(password);
  if (pwError) {
    ctx.status = 400;
    ctx.body = { code: 400, message: pwError };
    return;
  }

  const exists = await Member.query()
    .where((q) => q.where({ username }).orWhere({ email }))
    .first();
  if (exists) {
    ctx.status = 409;
    ctx.body = {
      code: 409,
      message: "이미 사용 중인 아이디 또는 이메일입니다.",
    };
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await Member.query().insert({
    username,
    password: hashed,
    name,
    email,
    phone: phone || null,
    status: 0,
  });

  ctx.status = 201;
  ctx.body = { code: 201, message: "회원가입이 완료되었습니다." };
});

router.post("/login", authLimiter, async (ctx) => {
  const { username, password } = ctx.request.body;

  if (!username || !password) {
    ctx.status = 400;
    ctx.body = { code: 400, message: "아이디와 비밀번호를 입력해주세요." };
    return;
  }

  const member = await Member.query().findOne({ username });
  if (!member) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    };
    return;
  }

  if (member.status === 1) {
    ctx.status = 403;
    ctx.body = { code: 403, message: "차단된 계정입니다." };
    return;
  }

  const isValid = await bcrypt.compare(password, member.password);
  if (!isValid) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    };
    return;
  }

  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const token = jwt.sign(
    { id: member.id, username: member.username, name: member.name },
    process.env.JWT_SECRET,
    { expiresIn: jwtExpiresIn },
  );

  ctx.body = {
    code: 200,
    token,
    expiresIn: Math.floor(ms(jwtExpiresIn) / 1000), // 쿠키 maxAge 동기화용(초). JWT exp와 동일 원천
    member: {
      id: member.id,
      username: member.username,
      name: member.name,
      email: member.email,
    },
  };
});

// 비밀번호 재설정 링크 요청
router.post("/password/reset", authLimiter, async (ctx) => {
  const { username, email } = ctx.request.body;
  if (!username || !email) {
    ctx.status = 400;
    ctx.body = { code: 400, message: "아이디와 이메일을 입력해주세요." };
    return;
  }

  // 계정 존재 여부와 무관하게 동일 응답 (열거 방지)
  const member = await Member.query().findOne({ username, email });

  if (member) {
    // 이전에 발급한 미사용 토큰은 무효화하여 링크가 하나만 살아있도록 한다
    await PasswordResetToken.query()
      .delete()
      .where({ memberId: member.id })
      .whereNull("usedAt");

    const rawToken = crypto.randomBytes(32).toString("hex");
    await PasswordResetToken.query().insert({
      memberId: member.id,
      token: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetLink = `${FRONTEND_URL}/reset-password?token=${rawToken}`;

    try {
      const transporter = createTransport();
      await transporter.sendMail({
        from: `"썸페이" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "[썸페이] 비밀번호 재설정 안내",
        html: `
          <p>${escapeHtml(member.name)}님, 비밀번호 재설정을 위한 링크를 안내드립니다.</p>
          <p><a href="${resetLink}">비밀번호 재설정하기</a></p>
          <p>링크는 30분간 유효하며, 한 번만 사용할 수 있습니다.</p>
          <p>본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
        `,
      });
    } catch (e) {
      console.error("비밀번호 재설정 이메일 발송 실패:", e.message);
    }
  }

  ctx.body = {
    code: 200,
    message: "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.",
  };
});

// 재설정 링크의 토큰으로 새 비밀번호 설정
router.post("/password/reset/confirm", authLimiter, async (ctx) => {
  const { token, newPassword } = ctx.request.body;
  if (!token) {
    ctx.status = 400;
    ctx.body = { code: 400, message: "유효하지 않은 요청입니다." };
    return;
  }

  const pwError = validatePassword(newPassword);
  if (pwError) {
    ctx.status = 400;
    ctx.body = { code: 400, message: pwError };
    return;
  }

  const row = await PasswordResetToken.query()
    .findOne({ token: hashToken(token) })
    .whereNull("usedAt")
    .where("expiresAt", ">", new Date());

  if (!row) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: "유효하지 않거나 만료된 링크입니다. 다시 요청해주세요.",
    };
    return;
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await PasswordResetToken.transaction(async (trx) => {
    // usedAt 이 아직 비어있을 때만 사용 처리 → 동시 요청 시 토큰 재사용 방지
    const marked = await PasswordResetToken.query(trx)
      .patch({ usedAt: new Date() })
      .where({ id: row.id })
      .whereNull("usedAt");

    if (marked === 0) {
      const err = new Error(
        "유효하지 않거나 만료된 링크입니다. 다시 요청해주세요.",
      );
      err.status = 400;
      throw err;
    }

    await Member.query(trx).patchAndFetchById(row.memberId, {
      password: hashed,
    });
  });

  ctx.body = {
    code: 200,
    message: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.",
  };
});

module.exports = router;
