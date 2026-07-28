class Base {
  constructor(model) {
    this.model = model
  }

  get Model() {
    return this.model
  }

  query() {
    return this.model.query()
  }

  async findById(id, columns) {
    const query = this.model.query().findById(id)
    return columns ? query.select(...columns) : query
  }

  async findOne(where) {
    return this.model.query().findOne(where)
  }

  async insert(data) {
    return this.model.query().insertAndFetch(data)
  }

  async patchById(id, data) {
    return this.model.query().patchAndFetchById(id, data)
  }

  async deleteById(id) {
    return this.model.query().deleteById(id)
  }
}

module.exports = Base
