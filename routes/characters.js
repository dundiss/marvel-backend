const axios = require("axios");
// Import du package 'express'
const express = require("express");
// Appel à la fonction Router(), issue du package 'express'
const router = express.Router();

// Import du middleware isAuthenticated
const isAuthenticated = require("../middlewares/isAuthenticated");

router.get('/characters', /*isAuthenticated,*/ async (req, res) => {
    try {
        let url = `https://lereacteur-marvel-api.herokuapp.com/characters`;
        const { name, skip, limit } = req.query;
        const params = {}
        params.apiKey = process.env.MARVEL_API_KEY;

        if (name) {
            params.name = name;
        }

        if (skip) {
            params.skip = skip;
        }
        
        if (limit) {
            params.limit = limit;
        }

        //console.log(params);

        const response = await axios.get(url, { params } );
        //console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error(error.message);
    }
});

router.get('/character/:id', /*isAuthenticated,*/ async (req, res) => {
    try {
        const response = await axios.get(
            `https://lereacteur-marvel-api.herokuapp.com/character/${req.params.id}?apiKey=${process.env.MARVEL_API_KEY}`
        );
        //console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error(error.message);
    }
});

module.exports = router;
