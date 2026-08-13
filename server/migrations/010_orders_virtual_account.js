exports.up = async (knex) => {
  await knex.schema.table('orders', (t) => {
    t.string('virtualAccountNo', 50).nullable().defaultTo(null).after('pgTid')
    t.string('virtualAccountBank', 50).nullable().defaultTo(null).after('virtualAccountNo')
    t.datetime('virtualAccountExpiredAt').nullable().defaultTo(null).after('virtualAccountBank')
  })
}

exports.down = async (knex) => {
  await knex.schema.table('orders', (t) => {
    t.dropColumn('virtualAccountNo')
    t.dropColumn('virtualAccountBank')
    t.dropColumn('virtualAccountExpiredAt')
  })
}
