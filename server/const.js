const MEMBER_STATUS = { NORMAL: 0, BLOCKED: 1 }

const PAYMENT_METHOD = { CARD: 1, BANK: 2 }

const PAYMENT_STATUS = { PENDING: 0, DONE: 1, CANCELLED: 2 }

const CHARGE_STATUS = { PENDING: 0, DONE: 1, REFUNDED: 2 }

const INQUIRY_TYPE = { CHARGE: 1, PAYMENT: 2, CANCEL_REFUND: 3, ETC: 4 }

const INQUIRY_STATUS = { PENDING: 0, ANSWERED: 1 }

const PRODUCT_CATEGORY = {
  BROADCAST: 'broadcast',
  GAME: 'game',
  WEBTOON: 'webtoon',
  GIFTCARD: 'giftcard'
}

const PRODUCT_SUBCATEGORY = {
  FLEX: 'flex',
  SOOP: 'soop',
  TOON: 'toon',
  POPCORN: 'popcorn',
  PANDA: 'panda'
}

const MEMBER_PROFILE_COLUMNS = ['id', 'username', 'name', 'email', 'phone', 'flexUsername', 'createdAt']

// admin 응답에 회원 비밀번호 해시가 노출되지 않도록 member 조인/조회 시 컬럼을 제한한다.
const MEMBER_SAFE_COLUMNS = ['id', 'username', 'name', 'email', 'phone', 'flexUsername', 'status', 'createdAt']

const MEMBER_FIELD_LABELS = {
  phone: '전화번호',
  flexUsername: 'FlexTV 아이디'
}

const PRODUCT_FIELD_LABELS = {
  price: '가격',
  lexAmount: '렉스 수량',
  coinAmount: '코인 수량'
}

const INQUIRY_TITLE_MAX = 50
const INQUIRY_CONTENT_MAX = 1000

module.exports = {
  MEMBER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  CHARGE_STATUS,
  INQUIRY_TYPE,
  INQUIRY_STATUS,
  PRODUCT_CATEGORY,
  PRODUCT_SUBCATEGORY,
  MEMBER_PROFILE_COLUMNS,
  MEMBER_SAFE_COLUMNS,
  MEMBER_FIELD_LABELS,
  PRODUCT_FIELD_LABELS,
  INQUIRY_TITLE_MAX,
  INQUIRY_CONTENT_MAX
}
