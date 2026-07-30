exports.up = async (knex) => {
  await knex.schema.table('orders', (t) => {
    t.string('flexPaymentId', 100).nullable().defaultTo(null).after('chargedAt')
  })
}

exports.down = async (knex) => {
  await knex.schema.table('orders', (t) => {
    t.dropColumn('flexPaymentId')
  })
}
