const model = require("../models/product");

class ProductRepository {
  constructor() {}

  create = (product) => {
    try {
      return model.create(product);
    } catch (err) {
      console.error(err.message);
    }
  };

  update = (id, product) => {
    try {
      return model.findByIdAndUpdate(id, product);
    } catch (err) {
      console.error(err.message);
    }
  };

  delete = (id) => {
    try {
      return model.findByIdAndDelete(id);
    } catch (err) {
      console.error(err.message);
    }
  };

  findAll = () => {
    try {
      return model.find({});
    } catch (err) {
      console.error(err.message);
    }
  };

  findById = (id) => {
    try {
      return model.findById(id);
    } catch (err) {
      console.error(err.message);
    }
  };
}

module.exports = ProductRepository;
