import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGames, fetchGenres, addGame, updateGame, deleteGame, getUserProfile } from '../services/api';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const [games, setGames] = useState([]);
  const [editingGame, setEditingGame] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [profile, setProfile] = useState(null); // Изначально null, чтобы проверить, когда данные загружены
  const [loading, setLoading] = useState(true); // Для управления состоянием загрузки
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();
  const [newGame, setNewGame] = useState({
    title: '',
    genre: '',
    releaseDate: '',
    developer: '',
    publisher: '',
    platform: '',
    description: '',
    coverImage: '',
  });

  const platforms = ['PC', 'PlayStation', 'XBox', 'Nintendo'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Загружаем профиль пользователя
    getUserProfile()
      .then((response) => {
        setProfile(response.data);
        if (response.data.role !== 'admin') {
          navigate('/profile'); // Перенаправляем, если не админ
        }
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        navigate('/'); // Перенаправляем в случае ошибки
      })
      .finally(() => {
        setLoading(false); // Завершаем загрузку
      });
  }, [navigate]);

  useEffect(() => {
    // Загружаем список игр только после загрузки профиля и если пользователь админ
    if (profile?.role === 'admin') {
      fetchGames()
        .then((response) => setGames(response.data))
        .catch((error) => console.error('Error fetching games:', error));

      fetchGenres()
        .then((response) => setGenres(response))
        .catch((error) => console.error('Error fetching genres:', error));
    }
  }, [profile]);

  const handleAddGame = async () => {
    try {
      const addedGame = await addGame(newGame);
      setGames((prevGames) => [...prevGames, addedGame]);
      setNewGame({
        title: '',
        genre: '',
        releaseDate: '',
        developer: '',
        publisher: '',
        platform: '',
        description: '',
        coverImage: '',
      });
    } catch (error) {
      console.error('Error adding game:', error);
    }
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setIsEditModalVisible(true);
  };

  const handleSaveChanges = async () => {
    try {
      // console.log(editingGame);
      const updatedGame = await updateGame(editingGame);
      setGames((prevGames) => 
        prevGames.map((game) => 
          (game.gameid === updatedGame.gameid ? updatedGame : game)
      )
    );
      setEditingGame(null);
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      await deleteGame(gameId);
      setGames((prevGames) => prevGames.filter((game) => game.gameid !== gameId));
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGame((prevGame) => ({ ...prevGame, [name]: value }));
  };

  if (loading) {
    return <div>Loading...</div>; // Показываем индикатор загрузки
  }

  if (profile?.role !== 'admin') {
    return null; // Если пользователь не админ, ничего не показываем
  }

  return (
    <div className="admin-page">
      <h1 className="admin-title">Admin Page</h1>
      <h2 className="section-title">Manage Games</h2>
      <div className="form-container">
        <h3>Add New Game</h3>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newGame.title}
          onChange={handleInputChange}
          className="input-field"
        />
        <select
          name="genre"
          value={newGame.genre}
          onChange={handleInputChange}
          className="input-field"
        >                                                                                                                                                                                   
          <option value="">Select Genre</option>
          {genres.map((genre) => (
            <option key={genre.genreid} value={genre.genreid}>
              {genre.genrename}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="releaseDate"
          value={newGame.releaseDate}
          onChange={handleInputChange}
          className="input-field"
        />
        <input
          type="text"
          name="developer"
          placeholder="Developer"
          value={newGame.developer}
          onChange={handleInputChange}
          className="input-field"
        />
        <input
          type="text"
          name="publisher"
          placeholder="Publisher"
          value={newGame.publisher}
          onChange={handleInputChange}
          className="input-field"
        />
        <select
          name="platform"
          value={newGame.platform}
          onChange={handleInputChange}
          className="input-field"
        >
          <option value="">Select Platform</option>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          placeholder="Description"
          value={newGame.description}
          onChange={handleInputChange}
          className="input-field"
        ></textarea>
        <input
          type="text"
          name="coverImage"
          placeholder="Cover Image URL"
          value={newGame.coverImage}
          onChange={handleInputChange}
          className="input-field"
        />
        <button onClick={handleAddGame} className="add-button">Add Game</button>
      </div>
      <h3 className="section-title">Existing Games</h3>
      <ul className="game-list">
  {games.map((game) => (
    <li key={game.gameid} className="game-item">
      {game.title}{' '}
      <button
        onClick={() => handleEditGame(game)}
        className="update-button"
      >
        Update
      </button>
      <button
        onClick={() => handleDeleteGame(game.gameid)}
        className="delete-button"
      >
        Delete
      </button>
    </li>
  ))}
  {isEditModalVisible && (
  <div className="edit-modal">
    <div className="modal-content">
      <h3>Edit Game</h3>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={editingGame.title}
        onChange={(e) =>
          setEditingGame({ ...editingGame, title: e.target.value })
        }
        className="input-field"
      />
      <select
        name="genre"
        value={editingGame.genres[0]}
        onChange={(e) =>
          setEditingGame({ ...editingGame, genres: e.target.value })
        }
        className="input-field"
      >
        <option value="">Select Genre</option>
        {genres.map((genre) => (
          <option key={genre.genreid} value={genre.genreid}>
            {genre.genrename}
          </option>
        ))}
      </select>
      <input
        type="date"
        name="releaseDate"
        value={editingGame.releasedate}
        onChange={(e) =>
          setEditingGame({ ...editingGame, releasedate: e.target.value })
        }
        className="input-field"
      />
      <input
        type="text"
        name="developer"
        placeholder="Developer"
        value={editingGame.developer}
        onChange={(e) =>
          setEditingGame({ ...editingGame, developer: e.target.value })
        }
        className="input-field"
      />
      <input
        type="text"
        name="publisher"
        placeholder="Publisher"
        value={editingGame.publisher}
        onChange={(e) =>
          setEditingGame({ ...editingGame, publisher: e.target.value })
        }
        className="input-field"
      />
      <select
        name="platform"
        value={editingGame.platform}
        onChange={(e) =>
          setEditingGame({ ...editingGame, platform: e.target.value })
        }
        className="input-field"
      >
        <option value="">Select Platform</option>
        {platforms.map((platform) => (
          <option key={platform} value={platform}>
            {platform}
          </option>
        ))}
      </select>
      <textarea
        name="description"
        placeholder="Description"
        value={editingGame.description}
        onChange={(e) =>
          setEditingGame({ ...editingGame, description: e.target.value })
        }
        className="input-field"
      ></textarea>
      <input
        type="text"
        name="coverImage"
        placeholder="Cover Image URL"
        value={editingGame.coverimage}
        onChange={(e) =>
          setEditingGame({ ...editingGame, coverimage: e.target.value })
        }
        className="input-field"
      />
      <button onClick={handleSaveChanges} className="save-button">
        Save Changes
      </button>
      <button
        onClick={() => setIsEditModalVisible(false)}
        className="cancel-button"
      >
        Cancel
      </button>
    </div>
  </div>
)}
</ul>

    </div>
  );
};

export default AdminPage;
