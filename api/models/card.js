const mongoose = require("mongoose");

const cardSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        text: String,
        translation: String,
        status: String,
        difficulty: String,
        phonetic: String,
        meanings: Array,
    },
    { timestamps: { createdAt: "created_at" } },
);

module.exports = mongoose.model("Card", cardSchema);
