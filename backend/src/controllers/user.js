const UserModel = require("../models/user")

//info: {username, password, email, name, phone, studentid, memberFrom, graduated}
const register = (req, res) => {
  new UserModel(req.body).save((err, user) => {
    if(err) {
      console.error(err)
      res.status(500).send({
        "success": false,
        "msg": "Register failed"
      })
    }
    else {
      user.generateToken((err, token) => {
        if(err) {
          console.error(err)
          res.status(500).json({
            "success": false,
            "msg": "Please Login again"
          })
        }
        else {
          res.cookie("sfauth", token).status(200).send({"success": true})
        }
      })
    }
  })
}

const login = (req, res) => {
  UserModel.findOne({username: req.body.username}, (err, user) => {
    if(err || !user) {
      if(err) console.error(err)
      res.status(500).send({
        "success": false,
        "msg": "Login failed1"
      })
    }
    else {
      user.comparePassword(req.body.password, (err, isMatch) => {
        if(err || !isMatch) {
          if(err) console.error(err)
          res.status(500).json({
            "success": false,
            "msg": "Login failed2"
          })
        }
        else {
          user.generateToken((err, token) => {
            if(err) {
              res.status(500).json({
                "success": false,
                "msg": "Login failed3"
              })
            }
            else {
              res.cookie("sfauth", token).status(200).json({"success": true})
            }
          })
        }
      })
    }
  })
}

module.exports = {
  register,
  login,
};
