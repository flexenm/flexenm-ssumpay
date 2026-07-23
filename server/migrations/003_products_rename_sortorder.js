exports.up = async (knex) => {
  await knex.raw('ALTER TABLE products CHANGE sortOrder sort INT NOT NULL DEFAULT 0')
}

exports.down = async (knex) => {
  await knex.raw('ALTER TABLE products CHANGE sort sortOrder INT NOT NULL DEFAULT 0')
}
