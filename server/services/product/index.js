const { ValidationError } = require('objection')
const ProductsRepo = require('../../repositories/Products')
const UserError = require('../../utils/UserError')
const { PRODUCT_CATEGORY, PRODUCT_SUBCATEGORY, PRODUCT_FIELD_LABELS } = require('../../const')

// jsonSchema는 category/subcategory를 문자열 타입으로만 제한해서, PRODUCT_CATEGORY/PRODUCT_SUBCATEGORY에
// 정의된 값인지는 여기서 별도로 확인해야 한다. 값이 있을 때만 검사해서 부분 수정(undefined)은 통과시킨다.
function validateCategoryFields(category, subcategory) {
  if (category !== undefined && !Object.values(PRODUCT_CATEGORY).includes(category)) {
    throw new UserError('올바르지 않은 카테고리입니다.', 400)
  }
  if (subcategory !== undefined && !Object.values(PRODUCT_SUBCATEGORY).includes(subcategory)) {
    throw new UserError('올바르지 않은 서브카테고리입니다.', 400)
  }
}

// Product 엔티티의 jsonSchema 위반(objection ValidationError)을
// "price: should be >= 0" 같은 Ajv 원문 대신 한국어 메시지로 바꿔서 던진다.
function toFriendlyError(err) {
  const [field, issues] = Object.entries(err.data ?? {})[0] ?? []
  const label = PRODUCT_FIELD_LABELS[field] || field
  const keyword = issues?.[0]?.keyword

  if (keyword === 'minimum') return new UserError(`${label}은(는) 0 이상이어야 합니다.`, 400)
  if (keyword === 'type') return new UserError(`${label} 형식이 올바르지 않습니다.`, 400)
  return new UserError(`${label} 값이 올바르지 않습니다.`, 400)
}

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
  validateCategoryFields(category, subcategory)

  try {
    return await ProductsRepo.insert({
      category,
      subcategory,
      name,
      price,
      lexAmount: lexAmount || 0,
      coinAmount: coinAmount || 0,
      sort: sort || 0,
      isActive: 1
    })
  } catch (err) {
    if (err instanceof ValidationError) throw toFriendlyError(err)
    throw err
  }
}

async function updateProduct(id, { category, subcategory, name, price, lexAmount, coinAmount, isActive, sort }) {
  const product = await ProductsRepo.findById(id)
  if (!product) {
    throw new UserError('상품을 찾을 수 없습니다.', 404)
  }
  validateCategoryFields(category, subcategory)

  try {
    return await ProductsRepo.patchById(id, { category, subcategory, name, price, lexAmount, coinAmount, isActive, sort })
  } catch (err) {
    if (err instanceof ValidationError) throw toFriendlyError(err)
    throw err
  }
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
