const crypto = require('crypto')

// 헥토파이낸셜 규격: AES-256/ECB/PKCS5Padding + Base64, 키 = 상점 라이선스키(UTF-8 32바이트).
// ECB는 헥토가 지정한 방식이다 — 우리가 고른 게 아니므로 다른 모드로 바꾸면 연동이 깨진다.
function aesEncrypt(plain, licenseKey) {
  const cipher = crypto.createCipheriv('aes-256-ecb', Buffer.from(licenseKey, 'utf8'), null)
  return Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]).toString('base64')
}

function aesDecrypt(cipherB64, licenseKey) {
  const decipher = crypto.createDecipheriv('aes-256-ecb', Buffer.from(licenseKey, 'utf8'), null)
  return Buffer.concat([decipher.update(Buffer.from(cipherB64, 'base64')), decipher.final()]).toString('utf8')
}

function sha256Hex(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex')
}

// 결제창/채번 요청용: SHA256(mchtId + method + mchtTrdNo + trdDt + trdTm + trdAmt평문 + hashKey)
function makeRequestHash({ mchtId, method, mchtTrdNo, trdDt, trdTm, trdAmt }, hashKey) {
  return sha256Hex(`${mchtId}${method}${mchtTrdNo}${trdDt}${trdTm}${trdAmt}${hashKey}`)
}

// 취소 요청용: SHA256(trdDt + trdTm + mchtId + mchtTrdNo(취소용 주문번호) + cnclAmt평문 + hashKey)
// — flextv-webtoon에서 테스트베드 검증된 조합. 원거래번호(orgTrdNo)가 아니라 취소용 번호를 쓴다.
function makeCancelHash({ trdDt, trdTm, mchtId, mchtTrdNo, cnclAmt }, hashKey) {
  return sha256Hex(`${trdDt}${trdTm}${mchtId}${mchtTrdNo}${cnclAmt}${hashKey}`)
}

// 노티 검증용: SHA256(outStatCd + trdDtm앞8 + trdDtm뒤6 + mchtId + mchtTrdNo + trdAmt + hashKey)
// 대조는 timingSafeEqual — 문자열 == 비교는 타이밍 부채널이 생긴다.
function verifyNotiHash({ outStatCd, trdDtm, mchtId, mchtTrdNo, trdAmt, pktHash }, hashKey) {
  if (!pktHash || !trdDtm || String(trdDtm).length < 14) return false
  const dtm = String(trdDtm)
  const expected = sha256Hex(`${outStatCd}${dtm.slice(0, 8)}${dtm.slice(8, 14)}${mchtId}${mchtTrdNo}${trdAmt}${hashKey}`)
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(String(pktHash).toLowerCase(), 'utf8')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

module.exports = { aesEncrypt, aesDecrypt, sha256Hex, makeRequestHash, makeCancelHash, verifyNotiHash }
