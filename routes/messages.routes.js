const express = require("express");
const router = express.Router();

const controller = require("../api/message");

router.post("/guardar", async (req, res) => {
  try {
    await controller.create(req.body);

    const messages = await controller.findAll();

    const io = req.app.get("io");
    io.emit("messages", messages);

    return res.status(200).json(messages);
  } catch (err) {
    return res.status(400).json({ Message: err.Message, HasErrors: true });
  }
});

router.get("/leer", async (req, res) => {
  try {
    const objs = await controller.findAll();

    res.status(200).json(objs);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

module.exports = router;
