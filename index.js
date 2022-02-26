const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const morgan = require("morgan");
const app = express();
app.use(formidable());
app.use(cors());
app.use(morgan("dev"));

// Permet l'accès aux variables d'environnement
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI);

// Connexion à l'espace de stockage cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const userRoutes = require("./routes/user");
const favoriteRoutes = require("./routes/favorite");
const charactersRoutes = require("./routes/characters");
const comicsRoutes = require("./routes/comics");
app.use(userRoutes);
app.use(favoriteRoutes);
app.use(charactersRoutes);
app.use(comicsRoutes);

app.get("/", (req, res) => {
    res.json("Bienvenue sur l'API de Marvel");
});

app.use(function (err, req, res, next) {
    res.json({ error: err.message });
});

const server = app.listen(process.env.PORT, () => {
    console.log("Server started");
});
server.timeout = Number(process.env.SERVER_TIMEOUT) || 1000000;