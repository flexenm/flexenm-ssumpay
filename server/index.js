require('dotenv').config()

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const helmet = require('koa-helmet')
const cors = require('@koa/cors')

const routes = require('./routes')

const app = new Koa()

app.proxy = true

app.use(helmet())
app.use(cors({ credentials: true }))
app.use(bodyParser())

app.use(routes.routes())

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`ssumpay-server running on port ${PORT}`)
})
