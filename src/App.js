import { Oval } from 'react-loader-spinner';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function Grp204WeatherApp() {
  // État pour l'entrée utilisateur
  const [input, setInput] = useState('');
  // État pour les données météo actuelles
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    error: false,
  });
  // État pour les prévisions sur plusieurs jours
  const [forecast, setForecast] = useState([]);
  // État pour les villes favorites
  const [favoriteCities, setFavoriteCities] = useState(() => {
    return JSON.parse(localStorage.getItem('favoriteCities')) || [];
  });

  // Met à jour le localStorage lorsque les favoris changent
  useEffect(() => {
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
  }, [favoriteCities]);

  // Fonction pour obtenir la date actuelle formatée
  const toDateFunction = () => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 
      'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const WeekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const currentDate = new Date();
    return `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
  };

  // Fonction de recherche pour récupérer les données météo actuelles et les prévisions
  const search = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setInput(''); // Vide l'input après la recherche
      setWeather({ ...weather, loading: true }); // Indique que le chargement est en cours

      const urlCurrent = 'https://api.openweathermap.org/data/2.5/weather';
      const urlForecast = 'https://api.openweathermap.org/data/2.5/forecast';
      const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

      try {
        // Récupère les données météo actuelles et les prévisions en parallèle
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
          axios.get(urlCurrent, { params: { q: input, units: 'metric', appid: api_key } }),
          axios.get(urlForecast, { params: { q: input, units: 'metric', appid: api_key } })
        ]);

        // Met à jour les états avec les données reçues
        setWeather({ data: currentWeatherResponse.data, loading: false, error: false });
        // Filtre les prévisions pour afficher les données sur 5 jours (approximation)
        setForecast(forecastResponse.data.list.filter((_, index) => index % 8 === 0));
      } catch (error) {
        // Gestion des erreurs
        setWeather({ ...weather, data: {}, error: true });
        setForecast([]);
      }
    }
  };

  // Ajoute une ville aux favoris
  const saveFavoriteCity = (city) => {
    if (!favoriteCities.includes(city) && city) {
      setFavoriteCities([...favoriteCities, city]); // Ajoute la ville à la liste des favoris
    }
  };

  return (
    <div className="App">
      <h1 className="app-name">Application Météo grp204</h1>
      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={search} // Déclenche la recherche lorsqu'on appuie sur "Enter"
        />
        {/* Bouton pour ajouter la ville aux favoris */}
        <button onClick={() => saveFavoriteCity(input)}>Ajouter aux favoris</button>
      </div>

      {/* Liste des villes favorites */}
      <div className="favorites-list">
        {favoriteCities.map((city, index) => (
          <button key={index} onClick={() => setInput(city)}>
            {city}
          </button>
        ))}
      </div>

      {/* Affichage pendant le chargement des données */}
      {weather.loading && <Oval type="Oval" color="black" height={100} width={100} />}

      {/* Affichage d'un message d'erreur si la ville est introuvable */}
      {weather.error && (
        <span className="error-message">
          <FontAwesomeIcon icon={faFrown} />
          <span>Ville introuvable</span>
        </span>
      )}

      {/* Affichage des données météo actuelles */}
      {weather && weather.data && weather.data.main && (
        <div>
          <h2>{weather.data.name}, {weather.data.sys.country}</h2>
          <span>{toDateFunction()}</span>
          <img src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
            alt={weather.data.weather[0].description} />
          <p>{Math.round(weather.data.main.temp)}°C</p>
          <p>Vitesse du vent : {weather.data.wind.speed} m/s</p>
        </div>
      )}

      {/* Affichage des prévisions sur plusieurs jours */}
      {forecast.length > 0 && (
        <div className="forecast-container">
          <h3>Prévisions sur 5 jours</h3>
          {forecast.map((item, index) => (
            <div key={index} className="forecast-item">
              <p>{new Date(item.dt_txt).toLocaleDateString()}</p>
              <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} alt={item.weather[0].description} />
              <p>{Math.round(item.main.temp)}°C</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Grp204WeatherApp;
