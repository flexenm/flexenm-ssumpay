const bcrypt = require('bcrypt')
const { ValidationError } = require('objection')
const MembersRepo = require('../../repositories/Members')
const UserError = require('../../utils/UserError')
const { validatePassword, validateName } = require('../../utils/validators')
const { MEMBER_STATUS } = require('../../const')

const PROFILE_COLUMNS = ['id', 'username', 'name', 'email', 'phone', 'flexUsername', 'createdAt']

const FIELD_LABELS = {
  phone: '전화번호',
  flexUsername: 'FlexTV 아이디'
}

// Member 엔티티의 jsonSchema 위반(objection ValidationError)을
// "phone: should be string,null" 같은 Ajv 원문 대신 한국어 메시지로 바꿔서 던진다.
function toFriendlyError(err) {
  const [field, issues] = Object.entries(err.data ?? {})[0] ?? []
  const label = FIELD_LABELS[field] || field
  const keyword = issues?.[0]?.keyword

  if (keyword === 'type') return new UserError(`${label} 형식이 올바르지 않습니다.`, 400)
  return new UserError(`${label} 값이 올바르지 않습니다.`, 400)
}

async function getProfile(memberId) {
  return MembersRepo.findById(memberId, PROFILE_COLUMNS)
}

async function getSelf(memberId) {
  const member = await MembersRepo.findById(memberId)
  // 토큰은 유효하지만 계정이 삭제/차단된 경우도 미인증으로 처리
  if (!member || member.status === MEMBER_STATUS.BLOCKED) {
    throw new UserError('인증이 필요합니다.', 401)
  }
  return { id: member.id, username: member.username, name: member.name, email: member.email }
}

async function updateProfile(memberId, { name: rawName, phone, flexUsername }) {
  const name = typeof rawName === 'string' ? rawName.trim() : rawName

  if (name) {
    const nameError = validateName(name)
    if (nameError) {
      throw new UserError(nameError, 400)
    }
  }

  let updated
  try {
    updated = await MembersRepo.patchById(memberId, {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(flexUsername !== undefined && { flexUsername })
    })
  } catch (err) {
    if (err instanceof ValidationError) throw toFriendlyError(err)
    throw err
  }

  return {
    id: updated.id,
    username: updated.username,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    flexUsername: updated.flexUsername
  }
}

async function changePassword(memberId, { currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw new UserError('현재 비밀번호와 새 비밀번호를 입력해주세요.', 400)
  }

  const pwError = validatePassword(newPassword)
  if (pwError) {
    throw new UserError(pwError, 400)
  }

  const member = await MembersRepo.findById(memberId)
  const isValid = await bcrypt.compare(currentPassword, member.password)
  if (!isValid) {
    throw new UserError('현재 비밀번호가 올바르지 않습니다.', 401)
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  await MembersRepo.patchById(member.id, { password: hashed })
}

async function listForAdmin({ page, limit, keyword, status }) {
  return MembersRepo.listForAdmin({ page, limit, keyword, status })
}

async function getByIdForAdmin(id) {
  const member = await MembersRepo.findByIdForAdmin(id)
  if (!member) {
    throw new UserError('회원을 찾을 수 없습니다.', 404)
  }
  return member
}

async function updateStatus(id, status) {
  const statusNum = Number(status)
  if (status === undefined || ![MEMBER_STATUS.NORMAL, MEMBER_STATUS.BLOCKED].includes(statusNum)) {
    throw new UserError('올바른 상태값을 입력해주세요.', 400)
  }

  const member = await MembersRepo.findById(id)
  if (!member) {
    throw new UserError('회원을 찾을 수 없습니다.', 404)
  }

  await MembersRepo.patchStatus(id, statusNum)
  return statusNum === MEMBER_STATUS.BLOCKED ? '회원이 차단되었습니다.' : '차단이 해제되었습니다.'
}

module.exports = {
  getProfile,
  getSelf,
  updateProfile,
  changePassword,
  listForAdmin,
  getByIdForAdmin,
  updateStatus
}
