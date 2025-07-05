import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose, { mongo, Mongoose } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config(); //to access the environment variables
const app = express();
app.use(cors());
app.use(express.json()); //to parse incoming data
app.listen(3000, function () {
  console.log("server running at localhost:3000");
});

//connect the database using mongoose

mongoose
  .connect(process.env.MONGODB_URL)
  .then(function () {
    console.log("connected to database");
  })
  .catch(function (err) {
    console.log(err);
  });

//create schema from database

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//create schema for feedback

const feedbackSchema = new mongoose.Schema({
  name: String,
  message: String,
});

//create model for the model
const User = mongoose.model("User", userSchema);

//create model for feedback
const Feedback = mongoose.model("Feedback", feedbackSchema);

//post api for register
app.post("/register", async function (req, res) {
  const { email, password } = req.body;

  const userEmail = await User.findOne({ email });

  if (userEmail) {
    res.json("user already exist");
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email: email, password: hashedPassword });
  try {
    const result = await user.save();
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

//login api

app.post("/login", async function (req, res) {
  const { email, password } = req.body; //reading the data from client(req.body)
  const user = await User.findOne({ email }); //check whether user exist or not ;
  if (user) {
    //companre the user entered password with encrypted password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      //create token
      const token = await jwt.sign(email, "secret_key");
      res.json({ token: token }); //sending the success as message
    } else {
      res.json({ message: "password not matching " });
    }
  } else {
    res.json({ message: "user not found" });
  }
});

app.post("/feedback", async (req, res) => {
  const { name, message } = req.body;
  const feedback = new Feedback({ name: name, message: message });
  const result = await feedback.save();
  res.json(result);
});

app.get("/feedbacks", async (req, res) => {
  const feedbacks = await Feedback.find({});

  res.json(feedbacks);
});
