// Import du package 'express'
const express = require("express");
// Appel à la fonction Router(), issue du package 'express'
const router = express.Router();


// Import du model User et Favorite
// afin d'éviter des erreurs (notamment dues à d'eventuelles références entre les collections)
// on importe tous les models dans toutes les routes
const User = require("../models/User");
const Favorite = require("../models/Favorite");

// Import du middleware isAuthenticated
const isAuthenticated = require("../middlewares/isAuthenticated");

// Route qui nous permet de récupérer une liste de favoris, en fonction de filtres
// Si aucun filtre n'est envoyé, cette route renverra l'ensemble des favoris
router.get("/favorites", async (req, res) => {
    try {
        // création d'un objet dans lequel on va sotcker nos différents filtres
        let filters = {};

        if (req.query.characterId) {
            filters.character_id = new RegExp(req.query.characterId, "i");
        }

        let sort = {};

        let page = 1;
        if (req.query.page) {
            if (Number(req.query.page) < 1) {
                page = 1;
            } else {
                page = Number(req.query.page);
            }
        }        

        let limit = 1;
        if (req.query.limit) {
            limit = Number(req.query.limit);
        }

        const favorites = await Favorite.find(filters)
            .populate({
                path: "owner",
                select: "account",
            })
            .sort(sort)
            .skip((page - 1) * limit) // ignorer les x résultats
            .limit(limit); // renvoyer y résultats

        // cette ligne va nous retourner le nombre de favoris trouvées en fonction des filtres
        const count = await Favorite.countDocuments(filters);

        res.json({
            count: count,
            favorites: favorites,
        });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }
});

// Route qui permmet de récupérer les informations d'un favori en fonction de son id
router.get("/favorite/:characterId", async (req, res) => {
    try {
        const favorite = await Favorite.findOne({characterId : req.params.characterId}).populate({
            path: "owner",
            select: "account.username account.avatar",
        });
        if (favorite) {
            res.json(favorite);
        }
        else {
            res.status(400).json({ message: "characterId not found!" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }
});

router.put("/favorites/add/:characterId", isAuthenticated, async (req, res) => {
    // route qui permet d'ajouter un nouveau favori
    try {
        const { characterId } =
            req.params;

        if (characterId ) {
            // Création du nouveau favori
            const newFavorite = new Favorite({
                characterId: characterId,
                owner: req.user,
            });

            await newFavorite.save();
            res.json(newFavorite);
        } else {
            res
                .status(400)
                .json({ message: "characterId is required" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }
});

router.delete("/favorites/delete/:characterId", isAuthenticated, async (req, res) => {
    try {

        const favoriteToDelete = await Favorite.findOne({characterId : req.params.characterId});

        await favoriteToDelete.delete();

        res.status(200).json("Favorite deleted succesfully !");
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;