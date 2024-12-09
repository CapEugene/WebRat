import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

/*export const fetchGames = () => axios.get(`${API_URL}/games/`);
export const fetchGameDetails = (id) => axios.get(`${API_URL}/games/${id}`);
export const fetchGameReviews = (gameId) => axios.get(`${API_URL}/reviews/${gameId}`);
export const fetchReviewComments = (reviewId) => axios.get(`${API_URL}/comments/${reviewId}`);
export const addComment = (reviewId, commentText) => axios.post(`${API_URL}/comments/`, { reviewId, commentText });
export const registerUser = (data) => axios.post(`${API_URL}/auth/register/`, data);
export const loginUser = (data) => axios.post(`${API_URL}/auth/login/`, data);*/

export const fetchGames = () => apiClient.get(`/games/`);
export const fetchGameDetails = (id) => apiClient.get(`/games/${id}`);
export const fetchGameReviews = (gameId) => apiClient.get(`/reviews/${gameId}`);
export const fetchReviewComments = (reviewId) => apiClient.get(`/comments/${reviewId}`);
export const addComment = async (reviewId, commentText) => {
  const response = await apiClient.post('/comments/', { reviewId, commentText });
  return response.data; // Убедитесь, что возвращается полный объект комментария
};
export const addReview = async (gameId, rating, reviewText) => {
  const response = await apiClient.post('/reviews/', { gameId, rating, reviewText });
  return response.data;
};
export const registerUser = (data) => apiClient.post(`/auth/register/`, data);
export const loginUser = (data) => apiClient.post(`/auth/login/`, data);
export const getUserProfile = () => apiClient.get(`/users/profile/`);
export const getTokenInfo = () => apiClient.get(`/users/tokeninfo/`);
export const likeReview = async (reviewId) => {
  const response = await apiClient.post(`/reviews/${reviewId}/like/`);
  return response.data;
}