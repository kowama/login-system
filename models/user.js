const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const SECRET = "kowama123456";

//users schema
const userSchema = new mongoose.Schema({
  googleID: {
    type: String
  },
  facebookID: {
    type: String
  },
  profilePicture: {
    type: String
  },
  firstname: {
    type: String,
    trim: true,
    required: true
  },
  lastname: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    maxlength: 1,
    minlength: 1
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
    validate: {
      validator: value => {
        return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          value
        );
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        require: true
      }
    }
  ]
});

userSchema.methods.toJSON = function() {
  let user = this;
  let { _id, email } = user;

  return {
    _id,
    email
  };
};

userSchema.methods.generateAuthToken = function() {
  let user = this;

  let access = "auth";
  let token = jwt.sign({ _id: user._id.toHexString(), access }, SECRET);

  user.tokens = [...user.tokens, ...[{ access, token }]];

  return user.save().then(() => {
    return token;
  });
};

userSchema.methods.removeToken = function(token) {
  let user = this;
  return user.update({
    $pull: {
      tokens: { token }
    }
  });
};

userSchema.statics.findByToken = function(token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, secret);
    return User.findOne({
      _id: decoded._id,
      "tokens.token": token,
      "tokens.access": "auth"
    });
  } catch (err) {
    return Promise.reject();
  }
};

userSchema.statics.findByCredentials = function(email, password) {
  let User = this;

  return User.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, sucess) => {
        if (sucess) {
          resolve(user);
        }
        reject();
      });
    });
  });
};

userSchema.pre("save", function(next) {
  let user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model("User", userSchema);

module.exports = {
  User
};
