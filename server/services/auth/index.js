const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ms = require('ms')
const crypto = require('crypto')
const MembersRepo = require('../../repositories/Members')
const PasswordResetTokensRepo = require('../../repositories/PasswordResetTokens')
const RefreshTokensRepo = require('../../repositories/RefreshTokens')
const { createTransport, escapeHtml } = require('../../utils/mailer')
const { hashToken } = require('../../utils/hashToken')
const UserError = require('../../utils/UserError')
const { MEMBER_STATUS } = require('../../const')
const {
  validateUsername,
  validatePassword,
  validateEmail,
  validateName,
  normalizeEmail,
  hasMxRecord
} = require('../../utils/validators')

// 재설정 링크가 가리킬 프론트엔드 주소
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
// 재설정 링크 유효시간 (30분)
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000

async function checkUsernameAvailable(username) {
  if (!username) {
    throw new UserError('아이디를 입력해주세요.', 400)
  }

  const unError = validateUsername(username)
  if (unError) {
    throw new UserError(unError, 400)
  }

  const exists = await MembersRepo.findByUsername(username)
  return !exists
}

async function register({ username, password, phone, name: rawName, email: rawEmail }) {
  const name = typeof rawName === 'string' ? rawName.trim() : rawName
  const email = normalizeEmail(rawEmail)

  if (!username || !password || !name || !email) {
    throw new UserError('필수 항목을 입력해주세요.', 400)
  }

  const unError = validateUsername(username)
  if (unError) {
    throw new UserError(unError, 400)
  }

  const pwError = validatePassword(password)
  if (pwError) {
    throw new UserError(pwError, 400)
  }

  const nameError = validateName(name)
  if (nameError) {
    throw new UserError(nameError, 400)
  }

  const emailError = validateEmail(email)
  if (emailError) {
    throw new UserError(emailError, 400)
  }

  const mxValid = await hasMxRecord(email)
  if (!mxValid) {
    throw new UserError('존재하지 않는 이메일 도메인입니다.', 400)
  }

  const exists = await MembersRepo.findByUsernameOrEmail(username, email)
  if (exists) {
    throw new UserError('이미 사용 중인 아이디 또는 이메일입니다.', 409)
  }

  const hashed = await bcrypt.hash(password, 10)
  await MembersRepo.insert({
    username,
    password: hashed,
    name,
    email,
    phone: phone || null,
    status: 0
  })
}

// access token은 짧게(누출 시 노출 시간 최소화), 실제 세션 연장/무효화는 Redis에 저장되는 refresh token이 담당한다.
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'

function buildTokenResponse(member, refreshToken) {
  const accessToken = jwt.sign(
    { id: member.id, username: member.username, name: member.name },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  )

  return {
    accessToken,
    refreshToken,
    expiresIn: Math.floor(ms(ACCESS_TOKEN_EXPIRES_IN) / 1000),
    member: {
      id: member.id,
      username: member.username,
      name: member.name,
      email: member.email
    }
  }
}

async function issueTokenPair(member) {
  const refreshToken = await RefreshTokensRepo.issue({ type: 'member', id: member.id })
  return buildTokenResponse(member, refreshToken)
}

async function login({ username, password }) {
  if (!username || !password) {
    throw new UserError('아이디와 비밀번호를 입력해주세요.', 400)
  }

  const member = await MembersRepo.findByUsername(username)
  if (!member) {
    throw new UserError('아이디 또는 비밀번호가 올바르지 않습니다.', 401)
  }

  if (member.status === MEMBER_STATUS.BLOCKED) {
    throw new UserError('차단된 계정입니다.', 403)
  }

  const isValid = await bcrypt.compare(password, member.password)
  if (!isValid) {
    throw new UserError('아이디 또는 비밀번호가 올바르지 않습니다.', 401)
  }

  return issueTokenPair(member)
}

async function refresh({ refreshToken }) {
  if (!refreshToken) {
    throw new UserError('유효하지 않은 요청입니다.', 400)
  }

  const data = await RefreshTokensRepo.find(refreshToken)
  if (!data || data.type !== 'member') {
    throw new UserError('유효하지 않거나 만료된 토큰입니다.', 401)
  }

  const member = await MembersRepo.findById(data.id)
  if (!member || member.status === MEMBER_STATUS.BLOCKED) {
    await RefreshTokensRepo.revoke(refreshToken)
    throw new UserError('유효하지 않거나 만료된 토큰입니다.', 401)
  }

  const newRefreshToken = await RefreshTokensRepo.rotate(refreshToken, { type: 'member', id: member.id })
  return buildTokenResponse(member, newRefreshToken)
}

async function logout({ refreshToken }) {
  if (refreshToken) {
    await RefreshTokensRepo.revoke(refreshToken)
  }
}

async function requestPasswordReset({ username, email: rawEmail }) {
  // 가입 시 소문자로 저장되므로 조회 전에도 동일하게 정규화
  const email = normalizeEmail(rawEmail)
  if (!username || !email) {
    throw new UserError('아이디와 이메일을 입력해주세요.', 400)
  }

  // 계정 존재 여부와 무관하게 동일 응답 (열거 방지)
  const member = await MembersRepo.findOne({ username, email })

  if (member) {
    // 이전에 발급한 미사용 토큰은 무효화하여 링크가 하나만 살아있도록 한다
    await PasswordResetTokensRepo.deleteActiveByMember(member.id)

    const rawToken = crypto.randomBytes(32).toString('hex')
    await PasswordResetTokensRepo.insert({
      memberId: member.id,
      token: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
    })

    const resetLink = `${FRONTEND_URL}/reset-password?token=${rawToken}`

    try {
      const transporter = createTransport()
      await transporter.sendMail({
        from: `"썸페이" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '[썸페이] 비밀번호 재설정 안내',
        html: `
          <p>${escapeHtml(member.name)}님, 비밀번호 재설정을 위한 링크를 안내드립니다.</p>
          <p><a href="${resetLink}">비밀번호 재설정하기</a></p>
          <p>링크는 30분간 유효하며, 한 번만 사용할 수 있습니다.</p>
          <p>본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
        `
      })
    } catch (e) {
      console.error('비밀번호 재설정 이메일 발송 실패:', e.message)
    }
  }
}

async function confirmPasswordReset({ token, newPassword }) {
  if (!token) {
    throw new UserError('유효하지 않은 요청입니다.', 400)
  }

  const pwError = validatePassword(newPassword)
  if (pwError) {
    throw new UserError(pwError, 400)
  }

  const row = await PasswordResetTokensRepo.findActiveByHashedToken(hashToken(token))
  if (!row) {
    throw new UserError('유효하지 않거나 만료된 링크입니다. 다시 요청해주세요.', 400)
  }

  const hashed = await bcrypt.hash(newPassword, 10)

  await PasswordResetTokensRepo.transaction(async (trx) => {
    // usedAt 이 아직 비어있을 때만 사용 처리 → 동시 요청 시 토큰 재사용 방지
    const marked = await PasswordResetTokensRepo.markUsed(row.id, trx)

    if (marked === 0) {
      throw new UserError('유효하지 않거나 만료된 링크입니다. 다시 요청해주세요.', 400)
    }

    await MembersRepo.Model.query(trx).patchAndFetchById(row.memberId, { password: hashed })
  })
}

module.exports = {
  checkUsernameAvailable,
  register,
  login,
  refresh,
  logout,
  requestPasswordReset,
  confirmPasswordReset
}
