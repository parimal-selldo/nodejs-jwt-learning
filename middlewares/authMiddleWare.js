const jwt = require("jsonwebtoken");
const userModel = require("../servers/models/User");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check the jwt token is exists and verified
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/login");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
}

// check the current user
const checkCurrentUser = (req, res, next) => {
  const token = req.cookies.jwt;

  // making sure token exists in the cookies
  if (token) {
      // verify the token signature
      jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
          // wrong jwt token ( token has been tampered with or has expired )
          // set user to null
          if (err) {
              res.locals.user = null;
              next();
          }
          // best case scenario ( everything is perfect )
          else {
              // find user in db, populate user info
              const user = await userModel.findById(decodedToken.id);
              res.locals.user = user;
              next();
          }
      });
  }
  // if token does not exist in cookies, then set user to null, and go to next middleware
  else {
      res.locals.user = null;
      next();
  }
}

module.exports = { requireAuth, checkCurrentUser };
