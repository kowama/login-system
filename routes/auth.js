const router = require("express").Router();
const passport = require("passport");

router.get("/login", function(req, res, next) {
  res.render("login.hbs", {
    title: "login page"
  });
});

router.get("/local", (req, res, next) => {
  const password = req.body.password;
  const email = req.body.email;
  if (!(email && password)) {
    res.status(400).redirect("/login");
  }

  User.findByCredentials(email, password).then(
    user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    },
    err => {
      res.status(401).send(err);
    }
  );
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
  (req, res, next) => {
    res.render("profile");
  }
);
router.get(
  "/google/redirect",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.render("profile");
  }
);

router.get("/facebook", (req, res, next) => {
  res.render("profile");
});

router.get("/logout", (req, res, next) => {
  res.redirect("/");
});

module.exports = router;
