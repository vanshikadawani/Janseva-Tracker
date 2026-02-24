require("dotenv").config();
const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const Complaint = require("./models/complaint");

app.engine("ejs", ejsMate);   // ⭐ THIS LINE WAS MISSING
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
}
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.render("pages/home", { activePage: 'home' });
});

app.get("/report", (req, res) => {
  res.render("pages/report", { activePage: 'how-to' });
});

app.post("/report", upload.single("image"), async (req, res) => {
  await Complaint.create({
    category: req.body.category,
    description: req.body.description,
    image: req.file.filename
  });

  res.redirect("/complaints");
});

app.get("/complaints", async (req, res) => {
  const myComplaints = await Complaint.find({ createdBy: "Vanshika" });
  const otherComplaints = await Complaint.find({ createdBy: { $ne: "Vanshika" } });

  res.render("pages/complaint", {
    myComplaints,
    otherComplaints,
    activePage: 'complaints'
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});