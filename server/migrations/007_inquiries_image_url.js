exports.up = function (knex) {
  return knex.schema.alterTable('inquiries', (t) => {
    t.string('imageUrl', 500).nullable().after('content')
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('inquiries', (t) => {
    t.dropColumn('imageUrl')
  })
}
