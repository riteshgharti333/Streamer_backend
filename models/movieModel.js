import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    desc: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    isSeries: {
      type: Boolean,
      default: false,
    },
    stars: {
      type: Number,
      default: 5,
    },
    featureImg: {
      type: String,
      required: true,
    },
    featureSmImg: {
      type: String,
      required: true,
    },
    smImg: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Movie = mongoose.model("Movie" , MovieSchema);