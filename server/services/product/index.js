const ProductsRepo = require('../../repositories/Products')
const UserError = require('../../utils/UserError')

async function listActive({ category, subcategory }) {
  return ProductsRepo.listActive({ category, subcategory })
}

async function getActiveById(id) {
  const product = await ProductsRepo.findActiveByIdAndNotDeleted(id)
  if (!product) {
    throw new UserError('상품을 찾을 수 없습니다.', 404)
  }
  return product
}

async function listForAdmin({ category, subcategory, isActive, keyword }) {
  return ProductsRepo.listForAdmin({ category, subcategory, isActive, keyword })
}

async function createProduct({ category, subcategory, name, price, lexAmount, coinAmount, sort }) {
  if (!category || !subcategory || !name || price === undefined) {
    throw new UserError('필수 항목을 입력해주세요.', 400)
  }

  return ProductsRepo.insert({
    category,
    subcategory,
    name,
    price,
    lexAmount: lexAmount || 0,
    coinAmount: coinAmount || 0,
    sort: sort || 0,
    isActive: 1
  })
}

async function updateProduct(id, { category, subcategory, name, price, lexAmount, coinAmount, isActive, sort }) {
  const product = await ProductsRepo.findById(id)
  if (!product) {
    throw new UserError('상품을 찾을 수 없습니다.', 404)
  }

  return ProductsRepo.patchById(id, { category, subcategory, name, price, lexAmount, coinAmount, isActive, sort })
}

async function deleteProduct(id) {
  const product = await ProductsRepo.findById(id)
  if (!product) {
    throw new UserError('상품을 찾을 수 없습니다.', 404)
  }

  await ProductsRepo.softDeleteById(id)
}

module.exports = {
  listActive,
  getActiveById,
  listForAdmin,
  createProduct,
  updateProduct,
  deleteProduct
}
