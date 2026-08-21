#!/usr/bin/env bash
# 헥토 노티 모의 호출. 사용법:
#   HECTO_MCHT_ID=... HECTO_HASH_KEY=... ./scripts/mock-noti.sh <case> <orderNo> <amount>
#   case: card-approve | vbank-issue | vbank-deposit | bad-hash | wrong-amount
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
MCHT_ID="${HECTO_MCHT_ID:?HECTO_MCHT_ID 필요}"
HASH_KEY="${HECTO_HASH_KEY:?HECTO_HASH_KEY 필요}"
CASE="${1:?case 필요}"; ORDER_NO="${2:?orderNo 필요}"; AMOUNT="${3:?amount 필요}"

TRD_DTM=$(date +%Y%m%d%H%M%S)
TRD_NO="HECTO_MOCK_$(date +%s)"

hash_for() { # $1=outStatCd $2=amount
  printf '%s%s%s%s%s%s%s' "$1" "${TRD_DTM:0:8}" "${TRD_DTM:8:6}" "$MCHT_ID" "$ORDER_NO" "$2" "$HASH_KEY" | shasum -a 256 | cut -d' ' -f1
}

post() { # 나머지 인자를 -d 로 전달
  curl -s -X POST "$BASE_URL/webhooks/pg/payment" \
    -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' "$@"
  echo
}

case "$CASE" in
  card-approve)
    post -d "method=CA" -d "bizType=B0" -d "outStatCd=0021" -d "mchtId=$MCHT_ID" \
      -d "mchtTrdNo=$ORDER_NO" -d "trdNo=$TRD_NO" -d "trdDtm=$TRD_DTM" \
      -d "trdAmt=$AMOUNT" -d "cardApprNo=12345678" -d "pktHash=$(hash_for 0021 "$AMOUNT")" ;;
  vbank-issue)
    post -d "method=VA" -d "bizType=A0" -d "outStatCd=0051" -d "mchtId=$MCHT_ID" \
      -d "mchtTrdNo=$ORDER_NO" -d "trdNo=$TRD_NO" -d "trdDtm=$TRD_DTM" \
      -d "trdAmt=$AMOUNT" -d "vtlAcntNo=56211012345678" --data-urlencode "fnNm=신한은행" \
      -d "expireDt=$(date -v+10d +%Y%m%d%H%M%S 2>/dev/null || date -d '+10 days' +%Y%m%d%H%M%S)" \
      -d "pktHash=$(hash_for 0051 "$AMOUNT")" ;;
  vbank-deposit)
    post -d "method=VA" -d "bizType=B1" -d "outStatCd=0021" -d "mchtId=$MCHT_ID" \
      -d "mchtTrdNo=$ORDER_NO" -d "trdNo=$TRD_NO" -d "trdDtm=$TRD_DTM" \
      -d "trdAmt=$AMOUNT" -d "pktHash=$(hash_for 0021 "$AMOUNT")" ;;
  bad-hash)
    post -d "method=CA" -d "bizType=B0" -d "outStatCd=0021" -d "mchtId=$MCHT_ID" \
      -d "mchtTrdNo=$ORDER_NO" -d "trdNo=$TRD_NO" -d "trdDtm=$TRD_DTM" \
      -d "trdAmt=$AMOUNT" -d "pktHash=deadbeef" ;;
  wrong-amount) # 해시는 위조 금액 기준으로 유효 — 서버가 주문 금액과 대조해서 미확정으로 남겨야 함
    post -d "method=CA" -d "bizType=B0" -d "outStatCd=0021" -d "mchtId=$MCHT_ID" \
      -d "mchtTrdNo=$ORDER_NO" -d "trdNo=$TRD_NO" -d "trdDtm=$TRD_DTM" \
      -d "trdAmt=1" -d "pktHash=$(hash_for 0021 1)" ;;
  *) echo "unknown case: $CASE"; exit 1 ;;
esac
