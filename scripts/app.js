import { API_KEY } from "./env.js";


console.log("searchInput:", document.getElementById("searchInput"));
console.log("searchBtn:", document.getElementById("searchBtn"));

console.log("cityNameEl:", document.getElementById("cityName"));
console.log("conditionEl:", document.getElementById("condition"));
console.log("temperatureEl:", document.getElementById("temperature"));
console.log("humidityEl:", document.getElementById("humidity"));
console.log("windEl:", document.getElementById("wind"));

console.log("favoriteBtn:", document.getElementById("favoriteBtn"));
console.log("favoritesList:", document.getElementById("favoritesList"));

console.log("forecastContainer:", document.getElementById("forecast"));
console.log("forecastCityEl:", document.getElementById("forecastCity"));



const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const cityNameEl = document.getElementById("cityName");
const conditionEl = document.getElementById("condition");
const temperatureEl = document.getElementById("temperature");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");

const favoriteBtn = document.getElementById("favoriteBtn");
const favoritesList = document.getElementById("favoritesList");

const forecastContainer = document.getElementById("forecast");
const forecastCityEl = document.getElementById("forecastCity");



let currentCity = localStorage.getItem("currentCity") || "Stockton";
console.log("currentCity from localStorage:", currentCity);

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
console.log("favorites from localStorage:", favorites);



function saveData() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
  localStorage.setItem("currentCity", currentCity);

  console.log("Saved to localStorage:", {
    currentCity,
    favorites
  });
}



async function loadCurrentWeather(city) {
  if (!cityNameEl) return;

  console.log("loadCurrentWeather called with:", city);

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`
    );

    console.log("Current weather response status:", res.status);

    const data = await res.json();
    console.log("Current weather data:", data);

    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    conditionEl.textContent = data.weather[0].description;
    temperatureEl.textContent =
      `${Math.round(data.main.temp_max)}° / ${Math.round(data.main.temp_min)}°`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windEl.textContent = `${data.wind.speed} mph`;

  } catch (err) {
    console.error("Current weather error:", err);
    cityNameEl.textContent = "City not found";
  }
}



function renderFavorites() {
  if (!favoritesList) return;

  console.log("Rendering favorites:", favorites);

  favoritesList.innerHTML = "";

  favorites.forEach(city => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${city}</span>
      <button class="remove-btn">✕</button>
    `;

    li.querySelector("span").onclick = () => {
      console.log("Favorite selected:", city);
      currentCity = city;
      saveData();
      loadCurrentWeather(city);
      loadForecast(city);
    };

    li.querySelector("button").onclick = () => {
      console.log("Favorite removed:", city);
      favorites = favorites.filter(c => c !== city);
      saveData();
      renderFavorites();
    };

    favoritesList.appendChild(li);
  });
}


function getWeatherIcon(desc) {
  if (!desc) return "/assets/sunny.jpg";

  if (desc.toLowerCase().includes("thunder")) return "/assets/lightning storm.jpg";
  if (desc.toLowerCase().includes("rain")) return "/assets/rain lightning storm.jpg";
  if (desc.toLowerCase().includes("overcast")) return "/assets/cloudy-overcast.jpg";
  if (desc.toLowerCase().includes("cloud")) return "/assets/partly-cloudy.png";
  return "/assets/sunny.jpg";
}



async function loadForecast(city) {
  if (!forecastContainer) return;

  console.log("loadForecast called with:", city);

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${API_KEY}`
    );

    console.log("Forecast response status:", res.status);

    const data = await res.json();
    console.log("Forecast data:", data);

    forecastCityEl.textContent = `${data.city.name} 5-Day Forecast`;
    forecastContainer.innerHTML = "";

    const days = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];
      if (!days[date]) days[date] = item;
    });

    Object.values(days).slice(0, 5).forEach(day => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="forecast-icon">
          <img src="${getWeatherIcon(day.weather[0].description)}">
        </div>
        <div class="card-info">
          <div>${new Date(day.dt_txt).toLocaleDateString("en-US",{weekday:"short"})}</div>
          <div>${day.weather[0].description}</div>
          <div>${Math.round(day.main.temp_max)}° / ${Math.round(day.main.temp_min)}°</div>
        </div>
      `;

      forecastContainer.appendChild(card);
    });

  } catch (err) {
    console.error("Forecast error:", err);
  }
}



if (searchBtn) {
  searchBtn.onclick = () => {
    currentCity = searchInput.value.trim();
    console.log("Search clicked, city:", currentCity);
    saveData();
    loadCurrentWeather(currentCity);
    loadForecast(currentCity);
  };
}

if (favoriteBtn) {
  favoriteBtn.onclick = e => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Favorite button clicked");

    if (!favorites.includes(currentCity)) {
      favorites.push(currentCity);
      saveData();
      renderFavorites();
    }
  };
}



renderFavorites();
loadCurrentWeather(currentCity);
loadForecast(currentCity);
