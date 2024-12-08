const GameModel = require('../models/GameModel');

const getAllGames = async (req, res) => {
  try {
    const games = await GameModel.getAllGames();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getGameById = async (req, res) => {
  const { id } = req.params;
  try {
    const game = await GameModel.getGameById(id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllGames, getGameById };
