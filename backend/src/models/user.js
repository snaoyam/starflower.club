const { Schema, model } = require("mongoose")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const UserSchema = Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  studentid: {
    type: Number,
    required: true,
  },
  memberFrom: {
    type: Number,
    required: true,
  },
  isRest: {
    type: Boolean,
    default: false,
  },
  restDuration: {
    type: Number,
    default: 0,
  },
  inDeajeon: {
    type: Boolean,
    default: false,
  },
  graduated: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
  },
  permission: {
    admin: {
      type: Boolean,
      default: false,
    },
    coadmin: {
      type: Boolean,
      default: false,
    },
  },
  registeraccepted: {
    type: Boolean,
    default: false,
  },
  public: {
    name: {
      type: String,
    },
    inDeajeon: {
      type: Boolean,
      default: false,
    },
    graduated: {
      type: Boolean,
      default: false,
    }
  },
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
  const user = this
  if(user.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
  }
  if(user.isModified('name')) {
    user.public.name = user.name
  }
  if(user.isModified('inDeajeon')) {
    user.public.inDeajeon = user.inDeajeon
  }
  if(user.isModified('graduated')) {
    user.public.graduated = user.graduated
  }
  return next()
})

UserSchema.methods.comparePassword = function (passwd, callback) {
  bcrypt.compare(passwd, this.password, (err, match) => {
    if(err) {
      console.error(err)
      return callback(err, null)
    }
    callback(null, match)
  })
}

UserSchema.methods.generateToken = function (callback) {
  const user = this
  const token = jwt.sign({id: user._id.toHexString(), studentid: user.studentid, name: encodeURIComponent(user.name)}, process.env.jwtsecret, {expiresIn: '3h'})
  user.token = token
  user.save((err) => {
    if(err) {
      console.error(err)
      callback(err, null)
    }
    else callback(null, token)
  })
}

module.exports = model("User", UserSchema)