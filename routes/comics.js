const axios = require("axios");
// Import du package 'express'
const express = require("express");
// Appel à la fonction Router(), issue du package 'express'
const router = express.Router();

// Import du middleware isAuthenticated
const isAuthenticated = require("../middlewares/isAuthenticated");

router.get('/comics', /*isAuthenticated,*/ async (req, res) => {
    try {
        let url = `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.MARVEL_API_KEY}`;
        const { name, skip, limit } = req.query;
        if (title) {
            url += url + `&name=${title}`;
        }

        if (skip) {
            url += url + `&skip=${skip}`;
        }

        if (limit) {
            url += url + `&limit=${limit}`;
        }
        
        const response = await axios.get( url );
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