const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const keys = require("./../config/keys");
const { User } = require("./../models/user");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: "/auth/google/redirect"
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleID: profile.id.toString() })
        .then(user => {
          if (!user) {
            //if user don't exist create new user
            user = new User({
              googleID: profile.id,
              profilePicture: profile.photos[0].value,
              firstname: profile.name.familyName || "user",
              lastname: profile.name.givenName,
              password: "**************", ///???Very BAD
              gender: profile.gender,
              email: profile.emails[0].value
            });
            user.save().then(newUser => {
              done(null, newUser);
            });
          } else {
            done(null, user);
          }
        })
        .catch(err => {
          done(err, null);
        });
    }
  )
);
