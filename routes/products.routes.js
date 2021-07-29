const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const config = require("../config/config.json");

const router = express.Router();
const controller = require("../api/product");

router.use(cookieParser());
router.use(
  session({
    secret: "secreto",
    resave: false,
    saveUninitialized: false,
  })
);

const auth = (req, res, next) => {
  if (
    req.session &&
    req.session.username == config.admin &&
    req.session.admin
  ) {
    return next();
  } else {
    res.redirect("/login");
  }
};

router.get("/vista", auth, (req, res) => {
  res.redirect("/views/productos/vista");
});

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
