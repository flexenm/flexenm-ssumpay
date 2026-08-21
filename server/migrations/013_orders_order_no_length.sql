ALTER TABLE orders MODIFY orderNo VARCHAR(40) NOT NULL COMMENT '주문번호 (SP + yyyyMMddHHmmss + 회원ID + 랜덤6)';
