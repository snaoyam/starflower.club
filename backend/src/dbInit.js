const mongoose = require('mongoose')

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error!'));
db.once('open', () => console.log('Connected to MongoDB'));

const HOST = process.env.HOST ?? 'localhost'
mongoose.connect(`mongodb://${HOST}/sf_user_test`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("DB connected!")
})
.catch(err => {
  console.error("DB connection failed", err)
  process.exit()
})