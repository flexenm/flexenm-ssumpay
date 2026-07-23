-- 시드 이전 수동 등록 테스트 상품 + 오픈 준비 중인 game 카테고리 상품 소프트 삭제
UPDATE products
SET deletedAt = NOW()
WHERE deletedAt IS NULL
  AND (name LIKE 'FlexTV%' OR subcategory = '플렉스' OR category = 'game');
