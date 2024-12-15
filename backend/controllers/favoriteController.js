const FavoriteModel = require('../models/FavoriteModel');

const addFavorite = async (req, res) => {
    const userId = req.user.userid;

    if(!userId){
        return res.status(403).json({ message: 'Unauthorized' });
      }

    const { gameId } = req.body;
    try {
        const favorite = await FavoriteModel.addFavorite(userId, gameId);
        res.json(favorite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFavorites = async (req, res) => {
    const userId = req.user.userid;
    if(!userId){
        return res.status(403).json({ message: 'Unauthorized' });
      }

    try {
        const favorites = await FavoriteModel.getFavorites(userId);
        // console.log(favorites);
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeFavorite = async (req, res) => {
    const userId = req.user.userid;

    if(!userId){
        return res.status(403).json({ message: 'Unauthorized' });
      }

    const { gameId } = req.params;
    try {
        const favorite = await FavoriteModel.removeFavorite(userId, gameId);
        res.json(favorite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addFavorite, getFavorites, removeFavorite };
