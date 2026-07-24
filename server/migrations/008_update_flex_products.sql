-- 방송 상품 목록 개편
-- - 플렉스(flex): 구 상품 소프트 삭제 후 '렉스 N개' 6종으로 교체 (렉스 1개 = 110원, 5000개는 기획 확정값 55,000원)
-- - 나머지 방송 하위카테고리(SOOP·투네이션·팝콘티비·팬더)는 '준비 중'으로 노출 (활성 상품 제거)

-- CLI import 시 한글 깨짐 방지 (연결 charset 강제)
SET NAMES utf8mb4;
USE ssumpay;

-- 1. 기존 방송 상품(구 플렉스 + SOOP/팝콘티비) 소프트 삭제
UPDATE products
SET deletedAt = NOW()
WHERE deletedAt IS NULL
  AND name IN ('플렉스 10,000 LEX', '플렉스 30,000 LEX', 'SOOP 10,000 별풍선', '팝콘티비 10,000 팝콘');

-- 2. 신규 플렉스(렉스) 상품 6종 등록
INSERT INTO products (category, subcategory, name, price, lexAmount, coinAmount, isActive, sort) VALUES
  ('broadcast', 'flex', '렉스 100개',  11000,  100,  0, 1, 10),
  ('broadcast', 'flex', '렉스 300개',  33000,  300,  0, 1, 20),
  ('broadcast', 'flex', '렉스 500개',  55000,  500,  0, 1, 30),
  ('broadcast', 'flex', '렉스 1000개', 110000, 1000, 0, 1, 40),
  ('broadcast', 'flex', '렉스 3000개', 330000, 3000, 0, 1, 50),
  ('broadcast', 'flex', '렉스 5000개', 55000,  5000, 0, 1, 60);
