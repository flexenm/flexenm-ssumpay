const InquiriesRepo = require('../../repositories/Inquiries')
const { uploadInquiryImage } = require('../../utils/storage')
const { createTransport, escapeHtml } = require('../../utils/mailer')
const UserError = require('../../utils/UserError')
const { INQUIRY_TYPE } = require('../../const')

const TITLE_MAX = 50
const CONTENT_MAX = 1000

function validateInquiryText(title, content) {
  if (!title || title.length > TITLE_MAX) return `제목은 1~${TITLE_MAX}자 이내로 작성해주세요.`
  if (!content || content.length > CONTENT_MAX) return `내용은 1~${CONTENT_MAX}자 이내로 작성해주세요.`
  return null
}

async function listByMember(memberId, { page, limit }) {
  return InquiriesRepo.listByMember(memberId, { page, limit })
}

async function getByIdForMember(id, memberId) {
  const inquiry = await InquiriesRepo.findByIdForMember(id, memberId)
  if (!inquiry) {
    throw new UserError('문의를 찾을 수 없습니다.', 404)
  }
  return inquiry
}

async function createInquiry({ memberId, type, title, content, imageBuffer }) {
  if (type === undefined || type === null || type === '' || !title || !content) {
    throw new UserError('문의 유형, 제목, 내용을 입력해주세요.', 400)
  }

  const typeNum = Number(type)
  if (!Object.values(INQUIRY_TYPE).includes(typeNum)) {
    throw new UserError('올바르지 않은 문의 유형입니다.', 400)
  }

  const textError = validateInquiryText(title, content)
  if (textError) {
    throw new UserError(textError, 400)
  }

  const imageUrl = imageBuffer ? await uploadInquiryImage(imageBuffer) : null

  return InquiriesRepo.insert({ memberId, type: typeNum, title, content, imageUrl, status: 0 })
}

async function updateInquiry(id, memberId, { title, content, imageBuffer }) {
  const inquiry = await InquiriesRepo.findByIdForMember(id, memberId)
  if (!inquiry) {
    throw new UserError('문의를 찾을 수 없습니다.', 404)
  }
  if (inquiry.status !== 0) {
    throw new UserError('답변이 완료된 문의는 수정할 수 없습니다.', 403)
  }

  if (!title || !content) {
    throw new UserError('제목과 내용을 입력해주세요.', 400)
  }

  const textError = validateInquiryText(title, content)
  if (textError) {
    throw new UserError(textError, 400)
  }

  const patch = { title, content }
  if (imageBuffer) {
    patch.imageUrl = await uploadInquiryImage(imageBuffer)
  }

  return InquiriesRepo.patchById(inquiry.id, patch)
}

async function deleteInquiry(id, memberId) {
  const inquiry = await InquiriesRepo.findByIdForMember(id, memberId)
  if (!inquiry) {
    throw new UserError('문의를 찾을 수 없습니다.', 404)
  }
  if (inquiry.status !== 0) {
    throw new UserError('답변이 완료된 문의는 삭제할 수 없습니다.', 403)
  }

  await InquiriesRepo.softDeleteById(inquiry.id)
}

async function listForAdmin({ page, limit, status, type }) {
  return InquiriesRepo.listForAdmin({ page, limit, status, type })
}

async function getByIdForAdmin(id) {
  const inquiry = await InquiriesRepo.findByIdWithMember(id)
  if (!inquiry) {
    throw new UserError('문의를 찾을 수 없습니다.', 404)
  }
  return inquiry
}

async function answerInquiry(id, answer) {
  if (!answer || typeof answer !== 'string') {
    throw new UserError('답변 내용을 입력해주세요.', 400)
  }

  const inquiry = await InquiriesRepo.findByIdWithMember(id)
  if (!inquiry) {
    throw new UserError('문의를 찾을 수 없습니다.', 404)
  }

  await InquiriesRepo.patchAnswer(id, answer)

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
}

module.exports = {
  listByMember,
  getByIdForMember,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  listForAdmin,
  getByIdForAdmin,
  answerInquiry
}
