const express = require("express");
const app = express();
const User = require("./models/user");

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

app.get("/register", (req, res) => {
  res.render("register");
});

app.use("/secret", (req, res) => {
  res.send("This is secret! You cannot see me unless you login");
});

app.listen(3000, () => {
  console.log("Serving your app");
});
