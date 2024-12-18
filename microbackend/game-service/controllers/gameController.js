const GameModel = require('../models/GameModel');

const getAllGames = async (req, res) => {
  try {
    const games = await GameModel.getAllGames();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getGenres = async (req, res) => {
  try {
    //console.log("OK");
    const genres = await GameModel.getGenres();
    // console.log(genres);
    res.json(genres);
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

const addGame = async (req, res) => {
  const { title, genre, releaseDate, developer, publisher, platform, description, coverImage } = req.body;
  console.log(req);
  
  //console.log(req.user.userrole);
  if (req.user.userrole !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const newGame = await GameModel.addGame(title, releaseDate, developer, publisher, platform, description, coverImage);
    if (genre && genre.length > 0) {
      await GameModel.addGameGenres(newGame.gameid, genre);
    }
    
    res.status(201).json(newGame);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeGame = async (req, res) => {
  const { id } = req.params;

  if (req.user.userrole !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    await GameModel.removeGame(id);
    res.status(204).json({ message: 'Game deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateGame = async (req, res) => {
  const updateGame = req.body;
  try {
    await GameModel.updateGame(updateGame);
    await GameModel.addGameGenres(updateGame.gameid, updateGame.genres);
    res.status(204).json({ message: 'Game updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllGames, getGameById, addGame, removeGame, getGenres, updateGame };
