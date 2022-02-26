const mongoose = require("mongoose");

const Favorite = mongoose.model("Favorite", {
    favId: String,
    category: {
        type: String,
        enum: ['undefined', 'character', 'comic'],
        default: 'undefined'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = Favorite;