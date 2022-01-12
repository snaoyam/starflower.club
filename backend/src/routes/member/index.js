const express = require("express")
const router  = express.Router()
const validateToken = require("../../middleware/validateToken")
const gatherRouter = require("./gather")

router.use(validateToken)
router.use("/gather", gatherRouter)

module.exports = router