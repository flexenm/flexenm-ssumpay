const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ms = require('ms')
const AdminsRepo = require('../../repositories/Admins')
const MembersRepo = require('../../repositories/Members')
const OrdersRepo = require('../../repositories/Orders')
const InquiriesRepo = require('../../repositories/Inquiries')
const UserError = require('../../utils/UserError')

async function login({ username, password }) {
  if (!username || !password) {
    throw new UserError('아이디와 비밀번호를 입력해주세요.', 400)
  }

  const admin = await AdminsRepo.findActiveByUsername(username)
  if (!admin) {
    throw new UserError('아이디 또는 비밀번호가 올바르지 않습니다.', 401)
  }

  const isValid = await bcrypt.compare(password, admin.password)
  if (!isValid) {
    throw new UserError('아이디 또는 비밀번호가 올바르지 않습니다.', 401)
  }

  const adminJwtExpiresIn = '8h'
  const token = jwt.sign(
    { id: admin.id, username: admin.username, name: admin.name },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: adminJwtExpiresIn }
  )

  return {
    token,
    expiresIn: Math.floor(ms(adminJwtExpiresIn) / 1000),
    admin: { id: admin.id, username: admin.username, name: admin.name }
  }
}

async function getSelfProfile(adminId) {
  const admin = await AdminsRepo.findById(adminId)
  // 토큰은 유효하지만 계정이 삭제/비활성화된 경우도 미인증으로 처리
  if (!admin || !admin.isActive) {
    throw new UserError('인증이 필요합니다.', 401)
  }
  return { id: admin.id, username: admin.username, name: admin.name }
}

async function getDashboardStats() {
  const [totalMembers, todayOrderCount, pendingCharges, pendingInquiries, salesByDay] = await Promise.all([
    MembersRepo.countAll(),
    OrdersRepo.countToday(),
    OrdersRepo.countPendingCharge(),
    InquiriesRepo.countPending(),
    OrdersRepo.salesByDay(7)
  ])

  return { totalMembers, todayOrderCount, pendingCharges, pendingInquiries, salesByDay }
}

module.exports = {
  login,
  getSelfProfile,
  getDashboardStats
}
