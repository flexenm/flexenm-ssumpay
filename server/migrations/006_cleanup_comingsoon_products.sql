-- 오픈 준비 중인 webtoon / giftcard 카테고리 상품 소프트 삭제 (game 은 005 에서 처리)
UPDATE products
SET deletedAt = NOW()
WHERE deletedAt IS NULL
  AND category IN ('webtoon', 'giftcard');
