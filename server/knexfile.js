require('dotenv').config()

/** @type {import('knex').Knex.Config} */
const config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
  },
  migrations: {
    directory: './migrations',
    extension: 'js'
  },
  pool: { min: 2, max: 10 }
}

module.exports = config
