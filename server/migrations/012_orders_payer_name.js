exports.up = async (knex) => {
  await knex.schema.table('orders', (t) => {
    t.string('payerName', 50).nullable().defaultTo(null).after('virtualAccountExpiredAt')
  })
}

exports.down = async (knex) => {
  await knex.schema.table('orders', (t) => {
    t.dropColumn('payerName')
  })
}
