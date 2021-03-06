var db = require("../models");
var passport = require("../config/passport");
const { sequelize } = require("../models");


module.exports = function (app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function(req, res) {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function(req, res) {
    db.User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      chips: 1000,
      gamesPlayed: 0
    })
      .then(function() {
        res.redirect(307, "/api/login");
      })
      .catch(function(err) {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function(req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      db.User.findAll({
        where: {id: req.user.id}
      }).then((userData) => {
        res.json({
          name: req.user.userName,
          chips: userData[0]['dataValues'].chips,
          id: req.user.id
        });
      })
      .catch((err) => console.log(err));
    }
  });

  app.put("/api/update_user", function(req, res) {

    let updateObj = req.body.handPlayed ? {chips: req.body.chips, gamesPlayed: sequelize.literal('gamesPlayed + 1')} : {chips: req.body.chips};

    db.User.update(updateObj, {
      where: {
        id: req.body.id
      }
    }).then((dbUser) => {
      res.json(dbUser);
    });
  });

};