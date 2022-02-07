const mongoose = require('mongoose')

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error!'));
db.once('open', () => console.log('Connected to MongoDB'));

const DBHOST = process.env.DBHOST ?? 'localhost'
mongoose.connect(`mongodb://${DBHOST}`, {
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