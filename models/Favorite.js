const mongoose = require("mongoose");

const Favorite = mongoose.model("Favorite", {
    characterId: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = Favorite;