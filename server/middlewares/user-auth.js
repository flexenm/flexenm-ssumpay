const jwt = require('jsonwebtoken')
const Member = require('../entities/Member')
const { MEMBER_STATUS } = require('../const')

module.exports = async function userAuth(ctx, next) {
  const token = ctx.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    ctx.status = 401
    ctx.body = { code: 401, message: '인증이 필요합니다.' }
    return
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (e) {
    ctx.status = 401
    ctx.body = { code: 401, message: '유효하지 않은 토큰입니다.' }
    return
  }


  let member
  try{
    member = await Member.query().findById(decoded.id).select('id', 'status')
  }catch(e){
    ctx.status = 500
    ctx.body = { code: 500, message: '서버 오류가 발생했습니다.' }
    return
  }

  if (!member || member.status === MEMBER_STATUS.BLOCKED) {
    ctx.status = 401
    ctx.body = { code: 401, message: '인증이 필요합니다.' }
    return
  }

  ctx.state.member = { id: member.id, status: member.status }
  await next()
}
