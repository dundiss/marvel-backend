// Import du package 'express'
const express = require("express");
// Appel à la fonction Router(), issue du package 'express'
const router = express.Router();


// Import du model User et Favorite
// afin d'éviter des erreurs (notamment dues à d'eventuelles références entre les collections)
// nous vous conseillons d'importer tous vos models dans toutes vos routes
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

        if (req.query.title) {
            filters.comics_name = new RegExp(req.query.title, "i");
        }

        let sort = {};

        let page;
        if (Number(req.query.page) < 1) {
            page = 1;
        } else {
            page = Number(req.query.page);
        }

        let limit = Number(req.query.limit);

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
router.get("/favorite/:id", async (req, res) => {
    try {
        const favorite = await Favorite.findById(req.params.id).populate({
            path: "owner",
            select: "account.username account.avatar",
        });
        res.json(favorite);
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }
});

router.post("/favorite/add", isAuthenticated, async (req, res) => {
    // route qui permet d'ajouter un nouveau favori
    try {
        const { id } =
            req.fields;

        if (title && price && req.files.picture.path) {
            // Création du nouveau favori
            const newFavorite = new Favorite({
                comics_id: id,
                owner: req.user,
            });

            await newFavorite.save();
            res.json(newFavorite);
        } else {
            res
                .status(400)
                .json({ message: "id is required" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }
});

router.delete("/favorite/delete/:id", isAuthenticated, async (req, res) => {
    try {

        const favoriteToDelete = await Favorite.findById(req.params.id);

        await favoriteToDelete.delete();

        res.status(200).json("Favorite deleted succesfully !");
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;