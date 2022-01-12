const express = require("express")
const router  = express.Router()
const GatherModel = require("../../models/gather")

router.post('/post', (req, res) => {
  new GatherModel({...req.body, author: res.session.id}).save((err, user) => {
    if(err) {
      console.error(err)
      res.status(500).send({
        "success": false,
        "msg": "Post failed"
      })
    }
    else {
      res.status(200).send({"success": true})
    }
  })
})
router.post('/get', (req, res) => {
  GatherModel.find({time: { $gte: (new Date((new Date).valueOf() - 6*60*60*1000))}}).sort({'time': 1}).exec((err, posts) => {
    if(err) {
      console.error(err)
      res.status(200).send({"result": []})
    }
    else {
      res.status(200).send({"result": posts})
    }
  })
})

module.exports = router