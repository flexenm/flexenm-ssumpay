const NoticesRepo = require('../../repositories/Notices')
const UserError = require('../../utils/UserError')

async function listActive({ page, limit }) {
  return NoticesRepo.listActive({ page, limit })
}

async function getActiveByIdAndBumpViewCount(id) {
  const notice = await NoticesRepo.findActiveById(id)
  if (!notice) {
    throw new UserError('공지사항을 찾을 수 없습니다.', 404)
  }

  await NoticesRepo.incrementViewCount(notice.id)
  return { ...notice, viewCount: notice.viewCount + 1 }
}

async function listForAdmin({ page, limit, keyword, isPinned }) {
  return NoticesRepo.listForAdmin({ page, limit, keyword, isPinned })
}

async function getByIdForAdmin(id) {
  const notice = await NoticesRepo.findById(id)
  if (!notice) {
    throw new UserError('공지사항을 찾을 수 없습니다.', 404)
  }
  return notice
}

async function createNotice({ title, content, isPinned }) {
  if (!title || !content) {
    throw new UserError('제목과 내용을 입력해주세요.', 400)
  }

  return NoticesRepo.insert({ title, content, isPinned: isPinned ? 1 : 0, isActive: 1 })
}

async function updateNotice(id, { title, content, isPinned, isActive }) {
  const notice = await NoticesRepo.findById(id)
  if (!notice) {
    throw new UserError('공지사항을 찾을 수 없습니다.', 404)
  }

  return NoticesRepo.patchById(id, {
    title,
    content,
    isPinned: isPinned ? 1 : 0,
    isActive: isActive !== undefined ? isActive : notice.isActive
  })
}

async function deleteNotice(id) {
  await NoticesRepo.softDeleteById(id)
}

module.exports = {
  listActive,
  getActiveByIdAndBumpViewCount,
  listForAdmin,
  getByIdForAdmin,
  createNotice,
  updateNotice,
  deleteNotice
}
