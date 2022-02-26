// Import du package 'express'
const express = require("express");
// Appel à la fonction Router(), issue du package 'express'
const router = express.Router();

const axios = require("axios");

// Import du model User et Favorite
// afin d'éviter des erreurs (notamment dues à d'eventuelles références entre les collections)
// on importe tous les models dans toutes les routes
const User = require("../models/User");
const Favorite = require("../models/Favorite");

// Import du middleware isAuthenticated
const isAuthenticated = require("../middlewares/isAuthenticated");
const { query } = require("express");

const processFavorites = async (favoritesTab, results, userId, category) => {
    for await (const element of results) {
        const favorite = await Favorite.findOne({ favId: element._id, category: category })
            .populate({ path: 'owner', match: { _id: { $eq: userId } }, select: '_id' });

        if (favorite && favorite.owner) {
            console.log('favorite', favorite);
            // console.log('favorite', favorite);
            // console.log("element", element);
            favoritesTab.push(element);
            console.log('selectedFavorites.length', favoritesTab.length);
        }
    };
}

// Route qui nous permet de récupérer une liste de favoris, en fonction de filtres
// Si aucun filtre n'est envoyé, cette route renverra l'ensemble des favoris
router.get("/favorites", isAuthenticated, async (req, res) => {
    try {
        console.log(req.params);
        //Recherche des élements 
        const response = await axios.get(
            `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.MARVEL_API_KEY}`
        );

        const { results } = response.data;
        const selectedFavorites = [];

        
        if (results) {
            await processFavorites(selectedFavorites, results, req.user.id, "character");
            
            console.log('characters length', selectedFavorites.length);
        }
        else {
            console.log( "User has no favorite amongs the characters");
        }

        const response2 = await axios.get(
            `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.MARVEL_API_KEY}`
        );

        if (response2.data.results) {
            console.log('comics');
            await processFavorites(selectedFavorites, response2.data.results, req.user.id, "comic");

            console.log('comics length', selectedFavorites.length);            
        }
        else {
            console.log("User has no favorite amongs the comics");
            console.log(response2);
        }

        console.log("total length", selectedFavorites.length)
        if (selectedFavorites.length > 0) {
            res.json({ results: selectedFavorites });
        }
        else {
            res.status(400).json({ message: "User has no favorite" });
        }

        // création d'un objet dans lequel on va sotcker nos différents filtres
        // let filters = {};

        // if (req.query.id) {
        //     filters.favId = new RegExp(req.query.id, "i");
        // }

        // let sort = {};

        // let page = 1;
        // if (req.query.page) {
        //     if (Number(req.query.page) < 1) {
        //         page = 1;
        //     } else {
        //         page = Number(req.query.page);
        //     }
        // }        

        // let limit = 100;
        // if (req.query.limit) {
        //     limit = Number(req.query.limit);
        // }

        // const favorites = await Favorite.find(filters)
        //     .populate({
        //         path: "owner",
        //         select: "account",
        //     })
        //     .sort(sort)
        //     .skip((page - 1) * limit) // ignorer les x résultats
        //     .limit(limit); // renvoyer y résultats

        // // cette ligne va nous retourner le nombre de favoris trouvées en fonction des filtres
        // const count = await Favorite.countDocuments(filters);

        // res.json({
        //     count: count,
        //     favorites: favorites,
        // });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }
});

// Route qui permmet de récupérer les informations d'un favori en fonction de son id
router.get("/favorites/:category/:id", isAuthenticated, async (req, res) => {
    try {
        const favorite = await Favorite.findOne({favId : req.params.id}).populate({
            path: "owner",
            select: "account.username account.avatar",
        });
        if (favorite) {
            const response = await axios.get(
                `https://lereacteur-marvel-api.herokuapp.com/${category}/${id}?apiKey=${process.env.MARVEL_API_KEY}`
            );

            res.json(response.data);
        }
        else {
            res.status(400).json({ message: "Id not found!" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }
});

router.put("/favorites/add/:category/:id", isAuthenticated, async (req, res) => {
    // route qui permet d'ajouter un nouveau favori
    try {
        const { category, id } =
            req.params;

        if (id && category) {
            if ((category === 'character') || (category === 'comic')) {
                const response = await axios.get(
                    `https://lereacteur-marvel-api.herokuapp.com/${category}/${id}?apiKey=${process.env.MARVEL_API_KEY}`
                );

                const { _id } = response.data;
                //Double verification
                if (_id === id) {
                    // Création du nouveau favori
                    const newFavorite = new Favorite({
                        favId: id,
                        category: category,
                        owner: req.user,
                    });

                    await newFavorite.save();
                    res.json(newFavorite);
                }
                else {
                    res.status(400).json({ message: "Wrong favorite Id" });
                }
            }
        }
         else {
            res
                .status(400)
                .json({ message: "characterId is required" });
        }
    } 
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }
});

router.delete("/favorites/delete/:category/:id", isAuthenticated, async (req, res) => {
    try {
        const { category, id } = req.params;
        const favoriteToDelete = await Favorite.findOne({ favId: id, category: category});

        await favoriteToDelete.delete();

        res.status(200).json("Favorite deleted succesfully !");
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;