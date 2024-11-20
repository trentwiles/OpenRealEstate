const express = require("express");
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/static'));
app.use('/uploads', express.static(path.join(__dirname, '../api/tmp')));

app.get("/", async (req, res) => {
  res.render('home', { title: "Home" })
});

app.get("/search", async (req, res) => {
  res.render('search', { title: "Search" })
});

app.get("/p/:id/", async (req, res) => {
  res.render("property")
});

app.get("/list/:by/", async (req, res) => {
  res.render("by.ejs")
})

app.get("/export", async (req, res) => {
  res.render("export")
})

app.post("/export", async (req, res) => {
  // this page displays after the user has POSTed their email
  // frontend should record email in localstorage, this is
  // simply here for control flow, nothing is actually POSTed
  // to backend
  res.render("export2")
})

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});