const Router = require('koa-router')
const Inquiry = require('../../entities/Inquiry')
const db = require('../../db')
const { createTransport, escapeHtml } = require('../../utils/mailer')

const router = new Router()

router.get('/', async ctx => {
  const { page = 1, limit = 20, status, type } = ctx.query
  const offset = (page - 1) * limit

  let query = Inquiry.query().withGraphJoined('member').whereNull('inquiries.deletedAt').orderBy('inquiries.createdAt', 'desc')
  if (status !== undefined) query = query.where('inquiries.status', status)
  if (type !== undefined) query = query.where('inquiries.type', type)

  const [items, total] = await Promise.all([
    query.clone().limit(limit).offset(offset),
    query.clone().resultSize()
  ])

  ctx.body = { code: 200, data: items, total, page: Number(page), limit: Number(limit) }
})

router.get('/:id', async ctx => {
  const inquiry = await Inquiry.query().findById(ctx.params.id).withGraphJoined('member')
  if (!inquiry) {
    ctx.status = 404
    ctx.body = { code: 404, message: '문의를 찾을 수 없습니다.' }
    return
  }
  ctx.body = { code: 200, data: inquiry }
})

router.post('/:id/answer', async ctx => {
  const { answer } = ctx.request.body
  if (!answer) {
    ctx.status = 400
    ctx.body = { code: 400, message: '답변 내용을 입력해주세요.' }
    return
  }

  const inquiry = await Inquiry.query().findById(ctx.params.id).withGraphJoined('member')
  if (!inquiry) {
    ctx.status = 404
    ctx.body = { code: 404, message: '문의를 찾을 수 없습니다.' }
    return
  }

  await Inquiry.query().patchAndFetchById(ctx.params.id, {
    answer, status: 1, answeredAt: db.raw('NOW()')
  })

  if (inquiry.member?.email) {
    try {
      const transporter = createTransport()
      await transporter.sendMail({
        from: `"썸페이" <${process.env.SMTP_USER}>`,
        to: inquiry.member.email,
        subject: '[썸페이] 1:1 문의 답변이 등록되었습니다.',
        html: `
          <p>${escapeHtml(inquiry.member.name)}님, 문의하신 내용에 답변이 등록되었습니다.</p>
          <hr/>
          <p><strong>문의 제목:</strong> ${escapeHtml(inquiry.title)}</p>
          <p><strong>답변 내용:</strong></p>
          <p>${escapeHtml(answer).replace(/\n/g, '<br/>')}</p>
        `
      })
    } catch (e) {
      console.error('이메일 발송 실패:', e.message)
    }
  }

  ctx.body = { code: 200, message: '답변이 등록되었습니다.' }
})

module.exports = router