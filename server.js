const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const User = require("./models/user");

const passport = require("passport");
const bcrypt = require("bCrypt");
const LocalStrategy = require("passport-local").Strategy;

const dotenv = require("dotenv");

const controllersdb = require("./controllersdb");

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
      maxAge: 60000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

dotenv.config();

const http = require("http").Server(app);
var io = require("socket.io")(http);

app.set("io", io);

var options = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["htm", "html"],
  index: false,
  maxAge: "",
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set("x-timestamp", Date.now());
  },
};

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    //req.isAuthenticated() will return true if user is logged in
    next();
  } else {
    res.redirect("/login");
  }
}

app.use(express.static(__dirname + "/public", options));
app.use(
  "/views",
  checkAuthentication,
  express.static(__dirname + "/views", options)
);

app.use((err, req, res, next) => {
  console.error(err.message);
  return res.status(500).send("Algo se rompio!");
});

app.get("/", checkAuthentication);

passport.use(
  "login",
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    function (req, username, password, done) {
      // check in mongo if a user with username exists or not
      User.findOne({ username: username }, function (err, user) {
        // In case of any error, return using the done method
        if (err) return done(err);
        // Username does not exist, log error & redirect back
        if (!user) {
          console.log("User Not Found with username " + username);
          return done(
            null,
            false,
            //req.flash('message', 'User Not found.'));
            console.log("message", "User Not found.")
          );
        }
        // User exists but wrong password, log the error
        if (!isValidPassword(user, password)) {
          console.log("Invalid Password");
          return done(
            null,
            false,
            //req.flash('message', 'Invalid Password'));
            console.log("message", "Invalid Password")
          );
        }
        // User and password both match, return user from
        // done method which will be treated like success
        return done(null, user);
      });
    }
  )
);

passport.use(
  "signup",
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    function (req, username, password, done) {
      findOrCreateUser = function () {
        // find a user in Mongo with provided username
        User.findOne({ username: username }, function (err, user) {
          // In case of any error return
          if (err) {
            console.log("Error in SignUp: " + err);
            return done(err);
          }
          // already exists
          if (user) {
            console.log("User already exists");
            return done(
              null,
              false,
              //req.flash('message','User Already Exists'));
              console.log("message", "User Already Exists")
            );
          } else {
            // if there is no user with that email
            // create the user
            var newUser = new User();
            // set the user's local credentials
            newUser.username = username;
            newUser.password = createHash(password);

            // save the user
            newUser.save(function (err) {
              if (err) {
                console.log("Error in Saving user: " + err);
                throw err;
              }
              console.log("User Registration succesful");
              return done(null, newUser);
            });
          }
        });
      };
      // Delay the execution of findOrCreateUser and execute
      // the method in the next tick of the event loop
      process.nextTick(findOrCreateUser);
    }
  )
);

const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.get("/login");
app.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/faillogin",
    successRedirect: "/views/productos/vista",
  })
);
app.get("/faillogin");

app.get("/signup");
app.post(
  "/signup",
  passport.authenticate("signup", {
    failureRedirect: "/failsignup",
    successRedirect: "/views/productos/vista",
  })
);
app.get("/failsignup");

app.get("/getUserName", async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json(user.username);
});

app.get("/logoutview");

app.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

const productsRouter = require("./routes/products.routes");
app.use("productos", productsRouter, checkAuthentication);

const messagesRouter = require("./routes/messages.routes");
app.use("mensajes", messagesRouter, checkAuthentication);

io.on("connect", (socket) => {
  console.log("usuario conectado");
});

const PORT = process.env.PORT || 8080;

controllersdb.conectarDB(process.env.MONGO_ATLAS, (err) => {
  if (err) return console.log("error en conexión de base de datos", err);
  console.log("BASE DE DATOS CONECTADA");

  app.listen(PORT, function (err) {
    if (err) return console.log("error en listen server", err);
    console.log(`Server running on port ${PORT}`);
  });
});
