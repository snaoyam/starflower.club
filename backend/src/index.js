const express = require("express")
const app = express()

const cors = require("cors")
require("dotenv").config()
require('./dbInit')
const {register, login, logout} = require("./routes/auth")
const {getPublic} = require("./routes/user")
const memberRouter = require("./routes/member")
//const userRoutes = require('./routes/user')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const HOST = process.env.HOST ?? 'localhost';
var corsOptions = {
  origin: '{$HOST}:3000'
};
app.use(cors(corsOptions))

app.get("/api", (req, res) => {
  res.json({ message: "Backend for starflower.club/member" })
  console.log(req)
})

app.post("/api/register", register)
app.post("/api/login", login)
app.use("/api/logout", logout)

/*need validation*/
app.use("/api/member", memberRouter)

const PORT = Number(process.env.PORT) || 8080
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}.`)
})

