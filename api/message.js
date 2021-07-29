const MessageRepository = require("../repository/message-repository");

class MessageController {
  constructor() {
    this.messageRepository = new MessageRepository();
  }

  async findAll() {
    try {
      return await this.messageRepository.findAll();
    } catch (err) {
      console.log(err.Message);
    }
  }

  async create(data) {
    try {
      return await this.messageRepository.create(data);
    } catch (err) {
      console.log(err.Message);
    }
  }
}

module.exports = new MessageController();
