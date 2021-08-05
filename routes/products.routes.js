const express = require("express");

const router = express.Router();
const controller = require("../api/product");

router.get("/vista");

router.post("/guardar", async (req, res) => {
  try {
    await controller.create(req.body);

    const products = await controller.findAll();

    const io = req.app.get("io");
    io.emit("products", products);

    return res.status(200).json(products);
  } catch (err) {
    return res.status(400).json({ Message: err.Message, HasErrors: true });
  }
});

router.put("/actualizar/:id", async (req, res) => {
  try {
    await controller.update(req.params.id, req.body);

    const products = await controller.findAll();

    const io = req.app.get("io");
    io.emit("products", products);

    return res.status(200).json(products);
  } catch (err) {
    return res.status(400).json({ Message: err.Message, HasErrors: true });
  }
});

router.delete("/borrar/:id", async (req, res) => {
  try {
    await controller.delete(req.params.id);

    const products = await controller.findAll();

    const io = req.app.get("io");
    io.emit("products", products);

    return res.status(200).json(products);
  } catch (err) {
    return res.status(400).json({ Message: err.Message, HasErrors: true });
  }
});

router.get("/listar", async (req, res) => {
  try {
    const objs = await controller.findAll();

    res.status(200).json(objs);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

router.get("/listar/:id", async (req, res) => {
  try {
    const objs = await controller.findById(req.params.id);

    res.status(200).json(objs);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

module.exports = router;
