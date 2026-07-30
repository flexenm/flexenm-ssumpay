const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ms = require('ms')
const AdminsRepo = require('../../repositories/Admins')
const MembersRepo = require('../../repositories/Members')
const OrdersRepo = require('../../repositories/Orders')
const InquiriesRepo = require('../../repositories/Inquiries')
const RefreshTokensRepo = require('../../repositories/RefreshTokens')
const UserError = require('../../utils/UserError')

const ADMIN_ACCESS_TOKEN_EXPIRES_IN = '8h'

function buildTokenResponse(admin, refreshToken) {
  const accessToken = jwt.sign(
    { id: admin.id, username: admin.username, name: admin.name },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: ADMIN_ACCESS_TOKEN_EXPIRES_IN }
  )

  return {
    accessToken,
    refreshToken,
    expiresIn: Math.floor(ms(ADMIN_ACCESS_TOKEN_EXPIRES_IN) / 1000),
    admin: { id: admin.id, username: admin.username, name: admin.name }
  }
}

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

  const refreshToken = await RefreshTokensRepo.issue({ type: 'admin', id: admin.id })
  return buildTokenResponse(admin, refreshToken)
}

async function refresh({ refreshToken }) {
  if (!refreshToken) {
    throw new UserError('유효하지 않은 요청입니다.', 400)
  }

  const data = await RefreshTokensRepo.find(refreshToken)
  if (!data || data.type !== 'admin') {
    throw new UserError('유효하지 않거나 만료된 토큰입니다.', 401)
  }

  const admin = await AdminsRepo.findById(data.id)
  if (!admin || !admin.isActive) {
    await RefreshTokensRepo.revoke(refreshToken)
    throw new UserError('유효하지 않거나 만료된 토큰입니다.', 401)
  }

  const newRefreshToken = await RefreshTokensRepo.rotate(refreshToken, { type: 'admin', id: admin.id })
  return buildTokenResponse(admin, newRefreshToken)
}

async function logout({ refreshToken }) {
  if (refreshToken) {
    await RefreshTokensRepo.revoke(refreshToken)
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
  refresh,
  logout,
  getSelfProfile,
  getDashboardStats
}
