const FLEXTV_API_URL = process.env.FLEXTV_API_URL
const FLEXTV_API_KEY = process.env.FLEXTV_API_KEY

function assertConfigured() {
  if (!FLEXTV_API_URL || !FLEXTV_API_KEY) {
    throw Object.assign(new Error('FlexTV 렉스 지급 API 설정이 없습니다.'), { status: 503 })
  }
}

// FlexTV 렉스 지급 API 호출 (docs/flextv-lex-charge-api.md 스펙).
// orderNo가 멱등성 키 — FlexTV가 이미 처리한 orderNo로 재요청하면 재지급 없이
// 기존 결과를 duplicated:true로 반환하도록 스펙에 명시되어 있음.
// FlexTV 측 엔드포인트가 아직 신설되지 않아 호출 시 501을 던지는 스텁 상태.
async function chargeLex({ loginId, lexAmount, orderNo, productName, memo }) {
  assertConfigured()
  throw Object.assign(new Error('FlexTV 렉스 지급 API가 아직 신설되지 않았습니다 (chargeLex).'), { status: 501 })
}

module.exports = {
  chargeLex
}
