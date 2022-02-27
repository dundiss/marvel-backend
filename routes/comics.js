const axios = require("axios");
// Import du package 'express'
const express = require("express");
// Appel à la fonction Router(), issue du package 'express'
const router = express.Router();

// Import du middleware isAuthenticated
const isAuthenticated = require("../middlewares/isAuthenticated");

router.get('/comics', /*isAuthenticated,*/ async (req, res) => {
    try {
        let url = `https://lereacteur-marvel-api.herokuapp.com/comics`;
        console.log(req.query);
        const { title, skip, limit } = req.query;
        const params = {}
        params.apiKey = process.env.MARVEL_API_KEY;

        if (title) {
            params.title = title;
        }

        if (skip) {
            params.skip = skip;
        }

        if (limit) {
            params.limit = limit;
        }


        const response = await axios.get(url, { params } );
        //console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error(error.message);
    }
});

router.get('/comic/:id', /*isAuthenticated,*/ async (req, res) => {
    try {
        const response = await axios.get(
            `https://lereacteur-marvel-api.herokuapp.com/comic/${req.params.id}?apiKey=${process.env.MARVEL_API_KEY}`
        );
        //console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error(error.message);
    }
});

module.exports = router;