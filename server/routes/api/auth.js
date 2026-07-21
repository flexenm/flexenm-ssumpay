const Router = require('koa-router')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const Member = require('../../entities/Member')
const rateLimit = require('../../middlewares/rate-limit')
const { createTransport, escapeHtml } = require('../../utils/mailer')

const router = new Router()

const authLimiter = rateLimit({ windowMs: 60_000, max: 10, message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' })

function validatePassword(password) {
  if (!password || password.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
  return null
}

// 아이디 중복확인
router.get('/check-username', authLimiter, async ctx => {
  const { username } = ctx.query
  if (!username) {
    ctx.status = 400
    ctx.body = { code: 400, message: '아이디를 입력해주세요.' }
    return
  }

  const exists = await Member.query().findOne({ username })
  ctx.body = { code: 200, available: !exists }
})

router.post('/register', authLimiter, async ctx => {
  const { username, password, name, email, phone } = ctx.request.body

  if (!username || !password || !name || !email) {
    ctx.status = 400
    ctx.body = { code: 400, message: '필수 항목을 입력해주세요.' }
    return
  }

  const pwError = validatePassword(password)
  if (pwError) {
    ctx.status = 400
    ctx.body = { code: 400, message: pwError }
    return
  }

  const exists = await Member.query().where(q => q.where({ username }).orWhere({ email })).first()
  if (exists) {
    ctx.status = 409
    ctx.body = { code: 409, message: '이미 사용 중인 아이디 또는 이메일입니다.' }
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  await Member.query().insert({ username, password: hashed, name, email, phone: phone || null, status: 0 })

  ctx.status = 201
  ctx.body = { code: 201, message: '회원가입이 완료되었습니다.' }
})

router.post('/login', authLimiter, async ctx => {
  const { username, password } = ctx.request.body

  if (!username || !password) {
    ctx.status = 400
    ctx.body = { code: 400, message: '아이디와 비밀번호를 입력해주세요.' }
    return
  }

  const member = await Member.query().findOne({ username })
  if (!member) {
    ctx.status = 401
    ctx.body = { code: 401, message: '아이디 또는 비밀번호가 올바르지 않습니다.' }
    return
  }

  if (member.status === 1) {
    ctx.status = 403
    ctx.body = { code: 403, message: '차단된 계정입니다.' }
    return
  }

  const isValid = await bcrypt.compare(password, member.password)
  if (!isValid) {
    ctx.status = 401
    ctx.body = { code: 401, message: '아이디 또는 비밀번호가 올바르지 않습니다.' }
    return
  }

  const token = jwt.sign(
    { id: member.id, username: member.username, name: member.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

  ctx.body = {
    code: 200,
    token,
    member: { id: member.id, username: member.username, name: member.name, email: member.email }
  }
})

router.post('/password/reset', authLimiter, async ctx => {
  const { username, email } = ctx.request.body
  if (!username || !email) {
    ctx.status = 400
    ctx.body = { code: 400, message: '아이디와 이메일을 입력해주세요.' }
    return
  }

  // 계정 존재 여부와 무관하게 동일 응답 (열거 방지)
  const member = await Member.query().findOne({ username, email })

  if (member) {
    const tempPassword = crypto.randomBytes(6).toString('hex')
    const hashed = await bcrypt.hash(tempPassword, 10)
    await Member.query().patchAndFetchById(member.id, { password: hashed })

    try {
      const transporter = createTransport()
      await transporter.sendMail({
        from: `"썸페이" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '[썸페이] 임시 비밀번호 안내',
        html: `
          <p>${escapeHtml(member.name)}님, 임시 비밀번호를 안내드립니다.</p>
          <p><strong>임시 비밀번호: ${tempPassword}</strong></p>
          <p>로그인 후 반드시 비밀번호를 변경해주세요.</p>
        `
      })
    } catch (e) {
      console.error('비밀번호 재설정 이메일 발송 실패:', e.message)
    }
  }

  ctx.body = { code: 200, message: '입력하신 이메일로 임시 비밀번호를 발송했습니다.' }
})

module.exports = router
