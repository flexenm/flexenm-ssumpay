exports.up = async (knex) => {
  await knex.schema.table('notices', (t) => {
    t.datetime('deletedAt').nullable().defaultTo(null).after('updatedAt')
  })
}

exports.down = async (knex) => {
  await knex.schema.table('notices', (t) => {
    t.dropColumn('deletedAt')
  })
}
