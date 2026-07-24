// 오픈 준비 중 카테고리(webtoon, giftcard) 시드 상품 소프트 삭제
// game 은 005 에서 이미 처리됨
exports.up = async (knex) => {
  await knex('products')
    .whereNull('deletedAt')
    .whereIn('category', ['webtoon', 'giftcard'])
    .update({ deletedAt: knex.fn.now() })
}

exports.down = async (knex) => {
  await knex('products')
    .whereNotNull('deletedAt')
    .whereIn('category', ['webtoon', 'giftcard'])
    .update({ deletedAt: null })
}
