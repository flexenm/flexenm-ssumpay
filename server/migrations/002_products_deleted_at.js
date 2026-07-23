exports.up = async (knex) => {
  await knex.schema.table('products', (t) => {
    t.datetime('deletedAt').nullable().defaultTo(null).after('updatedAt')
  })
  await knex.schema.table('inquiries', (t) => {
    t.datetime('deletedAt').nullable().defaultTo(null).after('updatedAt')
  })
}

exports.down = async (knex) => {
  await knex.schema.table('products', (t) => {
    t.dropColumn('deletedAt')
  })
  await knex.schema.table('inquiries', (t) => {
    t.dropColumn('deletedAt')
  })
}
