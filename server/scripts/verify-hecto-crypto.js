// 헥토 암복호화 유틸 자가검증. 실행: node scripts/verify-hecto-crypto.js
const { aesEncrypt, aesDecrypt, sha256Hex, verifyNotiHash } = require('../services/hecto/crypto')

const KEY = '0123456789abcdef0123456789abcdef' // 32바이트 더미 키
let failed = 0
const assert = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`)
  if (!cond) failed++
}

// AES 라운드트립
assert('aes roundtrip', aesDecrypt(aesEncrypt('10000', KEY), KEY) === '10000')

// SHA-256 고정값 (echo -n "test" | shasum -a 256 과 동일해야 함)
assert('sha256 fixed', sha256Hex('test') === '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08')

// 노티 해시 검증 — 정상 / 금액 변조 / 해시 누락
const noti = { outStatCd: '0021', trdDtm: '20260813120000', mchtId: 'test_id', mchtTrdNo: 'SP123', trdAmt: '10000' }
const pktHash = sha256Hex(`${noti.outStatCd}${noti.trdDtm.slice(0, 8)}${noti.trdDtm.slice(8, 14)}${noti.mchtId}${noti.mchtTrdNo}${noti.trdAmt}HK`)
assert('noti hash ok', verifyNotiHash({ ...noti, pktHash }, 'HK') === true)
assert('noti hash tampered amount', verifyNotiHash({ ...noti, trdAmt: '99999', pktHash }, 'HK') === false)
assert('noti hash missing', verifyNotiHash({ ...noti, pktHash: undefined }, 'HK') === false)

process.exit(failed ? 1 : 0)
