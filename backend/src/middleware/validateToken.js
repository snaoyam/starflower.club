const jwt = require('jsonwebtoken')
const UserModel = require("../models/user")

const validateToken = (req, res, next) => {
  try {
    const token = req.headers.cookie.split('auth=')[1]
    if(!token) throw new Error('token not found')
    jwt.verify(token, process.env.jwtsecret, (err, decoded) => {
      if(err) throw new Error('token invalid')
      res["session"] = decoded
      if(decoded.exp*1000 - Date.now() < 1000*60*60) {
        UserModel.findOne({_id: decoded.id}, (err, user) => {
          if(err) throw new Error('user not found')
          /*else if(!user.registeraccepted) {
            return res.status(401).send({
              'success': false,
              'msg': 'Please wait for acception'
            })
          }*/
          user.generateToken((err, token) => {
            if(err) throw new Error('error while generating token')
            else {
              res.cookie("auth", token)
              return next()
            }
          })
        })
      }
      else
        return next()
    })
  }
  catch(err) {
    return res.status(401).send({
      'success': false,
      'msg': 'Not authorized'
    })
  }
}

module.exports = validateToken