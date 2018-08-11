const express = require("express");
const { mongodb } = require("./../models/db/mongodb");
const { User } = require("./../models/user");
const { authantificate } = require("./../midleware/authentificate");
const { authCheck } = require("./../midleware/authentificate");
const router = express.Router();

router.get("/register", (req, res) => {
  if (req.body.password !== req.body.passwordconfirm) {
    res.status(400).redirect("/users");
  }
  let user = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password
  });
  user
    .save()
    .then(user => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header("x-auth", token).render("profile.hbs", {
        user: user
      });
    })
    .catch(err => {
      res.status(400).redirect("/users");
    });
});

router.get("/profile", authCheck, (req, res) => {
  res.render("profile", {
    user: req.user
  });
});
router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});
module.exports = router;
