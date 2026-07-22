-- 상품 샘플 시드 데이터 (개발/데모용)
-- broadcast 는 lexAmount, 그 외 카테고리는 coinAmount 지급

-- CLI import 시 한글 깨짐 방지 (연결 charset 강제)
SET NAMES utf8mb4;
USE ssumpay;

INSERT INTO products (category, subcategory, name, price, lexAmount, coinAmount, isActive, sort) VALUES
  -- 방송 (LEX 지급)
  ('broadcast', 'flex',    '플렉스 10,000 LEX',   10000, 10000, 0, 1, 10),
  ('broadcast', 'flex',    '플렉스 30,000 LEX',   30000, 31000, 0, 1, 20),
  ('broadcast', 'soop',    'SOOP 10,000 별풍선',  10000, 10000, 0, 1, 30),
  ('broadcast', 'popcorn', '팝콘티비 10,000 팝콘', 10000, 10000, 0, 1, 40),

  -- 게임 (코인 지급)
  ('game', 'lol',    '리그오브레전드 10,000 RP',  10000, 0, 10000, 1, 10),
  ('game', 'lol',    '리그오브레전드 30,000 RP',  30000, 0, 31000, 1, 20),
  ('game', 'maple',  '메이플스토리 10,000 캐시',   10000, 0, 10000, 1, 30),
  ('game', 'genshin','원신 6,480 창옥',           10000, 0, 6480,  1, 40),

  -- 웹툰 (코인 지급)
  ('webtoon', 'toon', '투네이션 10,000 쿠키',  10000, 0, 10000, 1, 10),
  ('webtoon', 'toon', '투네이션 30,000 쿠키',  30000, 0, 31000, 1, 20),

  -- 상품권 (코인 지급)
  ('giftcard', 'culture', '컬처랜드 10,000원권',  10000, 0, 10000, 1, 10),
  ('giftcard', 'culture', '컬처랜드 50,000원권',  50000, 0, 50000, 1, 20);
