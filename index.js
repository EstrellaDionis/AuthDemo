const express = require("express");
const app = express();
const User = require("./models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

//mongo connection to db
mongoose.connect("mongodb://localhost:27017/authDemo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "notagoodsecret" }));

app.get("/", (req, res) => {
  res.send("this is the home page");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { password, username } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = new User({
    username,
    password: hash,
  });
  await user.save();
  req.session.user_id = user._id; //when you succesfully create a new user, we take the user id and store it in the session
  res.redirect("/secret");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username }); //we could also do username: username. This is finding our username in the db
  const validPassword = await bcrypt.compare(password, user.password); //remember, .compare in bcrypt requires a plain text password as the first argument and then the hash'd password in the db as the second
  if (validPassword) {
    req.session.user_id = user._id; //if you do successfully login, we store the user id in the session
    res.redirect("/secret");
  } else {
    res.send("/login");
  }
});

app.use("/secret", (req, res) => {
  //this only works because the other routes have the user id in the session. No login, no access!
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  res.send("This is secret! You cannot see me unless you login");
});

app.listen(3000, () => {
  console.log("Serving your app");
});
