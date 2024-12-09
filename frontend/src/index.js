import React from 'react';
import ReactDOM from 'react-dom/client'; // Новый модуль для создания корня
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // Создаем корень
root.render(<App />); // Рендерим приложение
