const { Schema, model } = require("mongoose")

const GatherSchema = Schema({
  author: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    trim: true,
    required: true,
  },
  contents: {
    type: String,
    default: '',
  },
  time: {
    type: Date,
    required: true,
  },
  place: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: '',
  },
  tag: {
    type: [String],
    default: [],
  },
}, { timestamps: true })

module.exports = model("Gather", GatherSchema)