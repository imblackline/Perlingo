const mongoose = require("mongoose");

const cardSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        text: { type: String, required: true },
        translation: String,
        status: String,
        difficulty: String,
        phonetic: String,
        meanings: Array,
        remember_ratio: Number,
    },
    { timestamps: { createdAt: "created_at" } },
);

module.exports = mongoose.model("Card", cardSchema);
