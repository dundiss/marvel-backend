const mongoose = require("mongoose");

const Favorite = mongoose.model("Favorite", {
    comics_id: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = Favorite;