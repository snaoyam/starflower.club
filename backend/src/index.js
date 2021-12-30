const express = require("express")
const app = express()

const cors = require("cors")
require("dotenv").config()
require('./dbInit')
const {register, login, logout} = require("./middleware/auth")
const {getPublic} = require("./middleware/user")
const validateToken = require("./middleware/validateToken")
//const userRoutes = require('./routes/user')


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const HOST = process.env.HOST ?? 'localhost';
var corsOptions = {
  origin: `http://${HOST}:80`
};
app.use(cors(corsOptions))

app.get("/", (req, res) => {
  res.json({ message: "Backend for starflower.club/member" })
})

app.post("/register", register)
app.post("/login", login)
app.post("/logout", logout)

/*need validation*/
app.use(validateToken)

app.get("/public", getPublic)

const PORT = Number(process.env.PORT) || 8080
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}.`)
})

