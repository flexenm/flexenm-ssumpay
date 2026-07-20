const Router = require('koa-router')

const authRouter = require('./auth')
const productsRouter = require('./products')
const ordersRouter = require('./orders')
const mypageRouter = require('./mypage')
const noticesRouter = require('./notices')
const inquiriesRouter = require('./inquiries')

const router = new Router({ prefix: '/api' })

router.use('/auth', authRouter.routes())
router.use('/products', productsRouter.routes())
router.use('/orders', ordersRouter.routes())
router.use('/mypage', mypageRouter.routes())
router.use('/notices', noticesRouter.routes())
router.use('/inquiries', inquiriesRouter.routes())

module.exports = router
