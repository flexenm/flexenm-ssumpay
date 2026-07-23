exports.up = async (knex) => {
  await knex('products').insert([
    { category: 'broadcast', subcategory: 'flex',    name: '플렉스 10,000 LEX',    price: 10000, lexAmount: 10000, coinAmount: 0, isActive: 1, sort: 10 },
    { category: 'broadcast', subcategory: 'flex',    name: '플렉스 30,000 LEX',    price: 30000, lexAmount: 31000, coinAmount: 0, isActive: 1, sort: 20 },
    { category: 'broadcast', subcategory: 'soop',    name: 'SOOP 10,000 별풍선',   price: 10000, lexAmount: 10000, coinAmount: 0, isActive: 1, sort: 30 },
    { category: 'broadcast', subcategory: 'popcorn', name: '팝콘티비 10,000 팝콘', price: 10000, lexAmount: 10000, coinAmount: 0, isActive: 1, sort: 40 },
    { category: 'game',      subcategory: 'lol',     name: '리그오브레전드 10,000 RP', price: 10000, lexAmount: 0, coinAmount: 10000, isActive: 1, sort: 10 },
    { category: 'game',      subcategory: 'lol',     name: '리그오브레전드 30,000 RP', price: 30000, lexAmount: 0, coinAmount: 31000, isActive: 1, sort: 20 },
    { category: 'game',      subcategory: 'maple',   name: '메이플스토리 10,000 캐시', price: 10000, lexAmount: 0, coinAmount: 10000, isActive: 1, sort: 30 },
    { category: 'game',      subcategory: 'genshin', name: '원신 6,480 창옥',      price: 10000, lexAmount: 0, coinAmount: 6480,  isActive: 1, sort: 40 },
    { category: 'webtoon',   subcategory: 'toon',    name: '투네이션 10,000 쿠키', price: 10000, lexAmount: 0, coinAmount: 10000, isActive: 1, sort: 10 },
    { category: 'webtoon',   subcategory: 'toon',    name: '투네이션 30,000 쿠키', price: 30000, lexAmount: 0, coinAmount: 31000, isActive: 1, sort: 20 },
    { category: 'giftcard',  subcategory: 'culture', name: '컬처랜드 10,000원권',  price: 10000, lexAmount: 0, coinAmount: 10000, isActive: 1, sort: 10 },
    { category: 'giftcard',  subcategory: 'culture', name: '컬처랜드 50,000원권',  price: 50000, lexAmount: 0, coinAmount: 50000, isActive: 1, sort: 20 },
  ])
}

exports.down = async (knex) => {
  await knex('products').whereIn('subcategory', ['flex', 'soop', 'popcorn', 'lol', 'maple', 'genshin', 'toon', 'culture']).delete()
}
