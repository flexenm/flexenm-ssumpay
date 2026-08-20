// 주문번호 형식 변경(SP + yyyyMMddHHmmss + 회원ID + 랜덤6)으로 최대 32자가 되어 컬럼을 40자로 확장.
exports.up = async (knex) => {
  await knex.raw("ALTER TABLE orders MODIFY orderNo VARCHAR(40) NOT NULL COMMENT '주문번호 (SP + yyyyMMddHHmmss + 회원ID + 랜덤6)'")
}

exports.down = async (knex) => {
  await knex.raw("ALTER TABLE orders MODIFY orderNo VARCHAR(30) NOT NULL COMMENT '주문번호 (YYYYMMDDHHMMSS + 랜덤)'")
}
