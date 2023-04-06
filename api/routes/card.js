const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Card = require("../models/card");
const translate = require("translate-google");
const axios = require("axios");

router.get("/", async (req, res, next) => {
    Card.find()
        .exec()
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.get("/:cardId", (req, res, next) => {
    const id = req.params.cardId;
    Card.findById(id)
        .exec()
        .then((result) => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({
                    message: "No valid card found with provided ID",
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});
router.patch("/:cardId", (req, res, next) => {
    const id = req.params.cardId;
    const updateOptions = {};
    for (const option of req.body) {
        updateOptions[option.propName] = option.value;
    }
    Card.findOneAndUpdate(
        { _id: id },
        {
            $set: updateOptions,
        },
    )
        .exec()
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});
router.delete("/:cardId", (req, res, next) => {
    const id = req.params.cardId;
    Card.findOneAndRemove({ _id: id })
        .exec()
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

const translation = async (text, target = "fa") => {
    const text = "Hello, world";
    const target = "fa";

    const translation = await translate(text, { from: "auto", to: target });
    return translation;
};

const getWordInformation = (word) => {
    axios
        .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then((resData) => {
            return {
                phonetic: resData.data[0].phonetic,
                partOfSpeech: resData.data[0].meanings[0].partOfSpeech,
                definitions: resData.data[0].meanings[0].definitions,
            };
        })
        .catch((err) => {
            console.log(err);
        });
};

router.post("/", (req, res, next) => {
    const card = new Card({
        _id: new mongoose.Types.ObjectId(),
        text: req.body.text,
        translation: req.body.translation,
        status: req.body.status,
    });
    card.save()
        .then((result) => {
            console.log(result);
            res.status(201).json({
                message: "handle post",
                createdCard: result,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;
