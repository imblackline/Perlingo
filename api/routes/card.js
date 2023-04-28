const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const checkAuth = require('../middleware/check-auth')
const Card = require("../models/card");
const translate = require("translate-google");
const axios = require("axios");

router.get("/",checkAuth, async (req, res, next) => {
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

router.get("/:cardId",checkAuth, (req, res, next) => {
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
router.patch("/againAll",checkAuth, (req, res, next) => {
    Card.updateMany({ status: "readed" }, { $set: { status: "need Practice" } })
        .exec()
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});
router.patch("/:cardId",checkAuth, (req, res, next) => {
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

router.delete("/:cardId",checkAuth, (req, res, next) => {
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
    // const text = "Hello, world";
    // const target = "fa";

    const translation = await translate(text, { from: "auto", to: target });
    return translation;
};

const getWordInformation = async (word) => {
    const detail = await axios
        .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then((resData) => {
            return {
                phonetic: resData.data[0].phonetic,
                meanings: resData.data[0].meanings,
            };
        })
        .catch((err) => {
            return "ERROR";
        });
    return detail;
};

router.post("/",checkAuth, async (req, res, next) => {
    const difficulty = req.body.difficulty ? req.body.difficulty : "easy";
    const card = new Card({
        _id: new mongoose.Types.ObjectId(),
        text: req.body.text,
        translation: await translation(req.body.text),
        status: "need Practice",
        remember_ratio: 0,
        difficulty: difficulty,
    });
    card.save()
        .then((result) => {
            // console.log(result);
            res.status(201).json({
                message: "handle post",
                createdCard: result,
            });
            //FIXME
            getWordInformation(result.text)
                .then((res) => {
                    if (res !== "ERROR") {
                        Card.findOneAndUpdate(
                            { _id: result._id },
                            {
                                $set: {
                                    phonetic: res.phonetic,
                                    meanings: res.meanings,
                                },
                            },
                        ).exec();
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;
