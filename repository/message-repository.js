const model = require("../models/message");

class messageRepository {
  constructor() {}

  create = (message) => {
    return model.create(message);
  };

  findAll = () => {
    return model.find({});
  };
}

module.exports = messageRepository;
