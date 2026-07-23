// 상품 데이터 정리
// - 시드(004) 이전에 수동 등록된 테스트 상품 소프트 삭제
//   (name 'FlexTV...' 구 명명 규칙 / subcategory 가 한글 '플렉스'로 저장된 행)
// - 게임 카테고리는 오픈 준비 중이므로 시드된 game 상품도 소프트 삭제
exports.up = async (knex) => {
  await knex('products')
    .whereNull('deletedAt')
    .where((q) =>
      q.where('name', 'like', 'FlexTV%')
        .orWhere({ subcategory: '플렉스' })
        .orWhere({ category: 'game' })
    )
    .update({ deletedAt: knex.fn.now() })
}

exports.down = async (knex) => {
  await knex('products')
    .whereNotNull('deletedAt')
    .where((q) =>
      q.where('name', 'like', 'FlexTV%')
        .orWhere({ subcategory: '플렉스' })
        .orWhere({ category: 'game' })
    )
    .update({ deletedAt: null })
}
