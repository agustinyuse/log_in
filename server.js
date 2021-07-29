const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "secreto",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60000,
    },
  })
);

const config = require("./config/config.json");
const dotenv = require("dotenv");

require("./database/connection");

dotenv.config();

const http = require("http").Server(app);
var io = require("socket.io")(http);

app.set("io", io);

var options = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["htm", "html"],
  index: false,
  maxAge: "1d",
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set("x-timestamp", Date.now());
  },
};

const auth = (req, res, next) => {
  if (
    req.session &&
    req.session.username == config.username &&
    req.session.admin
  ) {
    return next();
  } else {
    res.redirect("/login");
  }
};

app.use(express.static(__dirname + "/public", options));
app.use("/views", auth, express.static(__dirname + "/views", options));

app.use((err, req, res, next) => {
  console.error(err.message);
  return res.status(500).send("Algo se rompio!");
});

app.get("/", auth, (req, res) => {
  res.redirect("/views/productos/vista");
});

app.post("/login", (req, res) => {
  if (!req.body.username) {
    res.send("login fallo");
  } else if (req.body.username == config.username) {
    req.session.username = config.username;
    req.session.admin = true;

    return res.redirect("/views/productos/vista");
  }

  res.send("login fallo");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (!err) return res.redirect("logout");
    else res.send({ status: "Logout ERROR", body: err });
  });
});

app.get("/getUserName", (req, res) => {
  res.json(req.session.username);
});

const productsRouter = require("./routes/products.routes");
app.use("/productos", productsRouter, auth);

const messagesRouter = require("./routes/messages.routes");
app.use("/mensajes", messagesRouter);

io.on("connect", (socket) => {
  console.log("usuario conectado");
});

const PORT = process.env.PORT || config.PORT;

http.listen(PORT, () => {
  console.log(`servidor escuchando en http://localhost:${PORT}`);
});

http.on("error", (error) => {
  console.log("error en el servidor:", error);
});
