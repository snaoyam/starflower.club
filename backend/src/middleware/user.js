const UserModel = require("../models/user")

const getPublic = (req, res) => {
  UserModel.find({}, {public:true}, (error, result) => {
    if(error) {
        res.status(500).send({
          "success": false,
        })
    }
    else {
      res.status(500).send({
        "success": true,
        "result": result,
      })
    }
  })
}

module.exports = {
  getPublic,
};