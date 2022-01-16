const express = require("express")
const router  = express.Router()
const GatherModel = require("../../models/gather")

router.post('/post', (req, res) => {
  //req.body contains - title: String, contents: String, time: Date, place: String, link: String, tag: [String]
  new GatherModel({...req.body, author: {id: res.session.id, name: res.session.name}}).save((err, user) => {
    if(err) {
      console.error(err)
      res.status(200).send({
        "success": false,
        "msg": "Post failed"
      })
    }
    else {
      res.status(200).send({"success": true})
    }
  })
})
router.post('/delete', (req, res) => {
  //req.body contains - id: String
  const {postId} = req.body
  if(postId) {
    GatherModel.deleteOne({_id: postId}, (err) => {
      if(err)
        res.status(200).send({"success": false, "msg": "Delete failed"})
      else
        res.status(200).send({"success": true})
    })
  }
  else {
    res.status(500).send({"success": false, "msg": "Please check parameter again"})
  }
})
router.post('/get', (req, res) => {
  GatherModel.find({time: { $gte: (new Date((new Date).valueOf() - 6*60*60*1000))}}).sort({'time': 1}).exec((err, post) => {
    if(err) {
      console.error(err)
      res.status(200).send({"success": false, "result": []})
    }
    else {
      res.status(200).send({"success": true, "result": post})
    }
  })
})
router.post('/join', (req, res) => {
  //req.body contains - post _id: String
  const {postId} = req.body
  GatherModel.updateOne({_id: postId}, {
    $push: {
      member: {id: res.session.id, name: res.session.name}
    }
  }, (err, result) => {
    if(err) res.status(200).send({"success": false})
    if(result.matchedCount && result.modifiedCount)
      res.status(200).send({"success": true})
  })
})
router.post('/unjoin', (req, res) => {
  const {postId} = req.body
  GatherModel.updateOne({_id: postId}, {
    $pull: {
      member: {id: res.session.id, name: res.session.name}
    }
  }, (err, result) => {
    if(err) res.status(200).send({"success": false})
    if(result.matchedCount && result.modifiedCount)
      res.status(200).send({"success": true})
  })
})

module.exports = router