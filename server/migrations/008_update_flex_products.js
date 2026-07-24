// 방송 상품 목록 개편
// - 플렉스(flex): 구 상품(플렉스 10,000/30,000 LEX) 소프트 삭제 후 '렉스 N개' 6종으로 교체
//   (렉스 1개 = 110원, 단 5000개는 기획 확정값 55,000원 그대로 적용)
// - 나머지 방송 하위카테고리(SOOP·투네이션·팝콘티비·팬더)는 '준비 중'으로 노출
//   → 기존 활성 SOOP/팝콘티비 상품 소프트 삭제 (활성 상품 없으면 준비 중 처리)
const OLD_BROADCAST_NAMES = [
  '플렉스 10,000 LEX',
  '플렉스 30,000 LEX',
  'SOOP 10,000 별풍선',
  '팝콘티비 10,000 팝콘',
]

const NEW_FLEX_PRODUCTS = [
  { category: 'broadcast', subcategory: 'flex', name: '렉스 100개',  price: 11000,  lexAmount: 100,  coinAmount: 0, isActive: 1, sort: 10 },
  { category: 'broadcast', subcategory: 'flex', name: '렉스 300개',  price: 33000,  lexAmount: 300,  coinAmount: 0, isActive: 1, sort: 20 },
  { category: 'broadcast', subcategory: 'flex', name: '렉스 500개',  price: 55000,  lexAmount: 500,  coinAmount: 0, isActive: 1, sort: 30 },
  { category: 'broadcast', subcategory: 'flex', name: '렉스 1000개', price: 110000, lexAmount: 1000, coinAmount: 0, isActive: 1, sort: 40 },
  { category: 'broadcast', subcategory: 'flex', name: '렉스 3000개', price: 330000, lexAmount: 3000, coinAmount: 0, isActive: 1, sort: 50 },
  { category: 'broadcast', subcategory: 'flex', name: '렉스 5000개', price: 55000,  lexAmount: 5000, coinAmount: 0, isActive: 1, sort: 60 },
]

const NEW_FLEX_NAMES = NEW_FLEX_PRODUCTS.map((p) => p.name)

exports.up = async (knex) => {
  // 1. 기존 방송 상품(구 플렉스 + SOOP/팝콘티비) 소프트 삭제
  await knex('products')
    .whereNull('deletedAt')
    .whereIn('name', OLD_BROADCAST_NAMES)
    .update({ deletedAt: knex.fn.now() })

  // 2. 신규 플렉스(렉스) 상품 6종 등록
  await knex('products').insert(NEW_FLEX_PRODUCTS)
}

exports.down = async (knex) => {
  // 신규 플렉스 상품 제거
  await knex('products')
    .where({ category: 'broadcast', subcategory: 'flex' })
    .whereIn('name', NEW_FLEX_NAMES)
    .delete()

  // 소프트 삭제한 구 방송 상품 복구
  await knex('products')
    .whereNotNull('deletedAt')
    .whereIn('name', OLD_BROADCAST_NAMES)
    .update({ deletedAt: null })
}
