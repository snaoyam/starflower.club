const express = require("express")

const app = express()
require("dotenv").config()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const cors = require("cors")
const HOST = process.env.HOST ?? 'localhost';
var corsOptions = {
  origin: `http://${HOST}:80`
};
app.use(cors(corsOptions))

require('./dbInit')

app.get("/", (req, res) => {
  res.json({ message: "Backend for starflower.club/member" })
})

const userRoutes = require('./routes/user')
app.use("/", userRoutes)

const PORT = Number(process.env.PORT) || 8080
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}.`)
})