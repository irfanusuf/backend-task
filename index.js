const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("./models/user");

const app = express();
const port = 3000;


mongoose
    .connect('mongodb://127.0.0.1:27017/expressApp')
    .then((con) => console.log(`Database Connected: ${con.connection.host}`))
    .catch((err) => console.log(err));



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});


// all the apis are woking tested and debugged in postman  author :irfan usuf  

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = new User({ name, email, password });
        await user.save();
        res.json({ success: true, user });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid email or password");
  
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) return res.status(400).send("Invalid email or password");
  
    const token = user.generateAuthToken();
    res.header("x-auth-token", token).send({ email: user.email, token });
  });


// private route to profile details which will be only accesed after authorization through jwt token author :irfan usuf 


  app.get("/profile", authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("-password");
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, JWT_SECRET ='my secret key', (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }
  

app.listen(port, () => {
    console.log(`Server is Working on port: ${port}`);
});
