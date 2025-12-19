const API_KEY = "";

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
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function saveData() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
  localStorage.setItem("currentCity", currentCity);
}

async function loadCurrentWeather(city) {
  if (!cityNameEl) return;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`
    );
    const data = await res.json();

    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    conditionEl.textContent = data.weather[0].description;
    temperatureEl.textContent = `${Math.round(data.main.temp_max)}° / ${Math.round(data.main.temp_min)}°`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windEl.textContent = `${data.wind.speed} mph`;
  } catch {
    cityNameEl.textContent = "City not found";
  }
}

function renderFavorites() {
  if (!favoritesList) return;

  favoritesList.innerHTML = "";

  favorites.forEach(city => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${city}</span>
      <button class="remove-btn">✕</button>
    `;

    li.querySelector("span").onclick = () => {
      currentCity = city;
      saveData();
      loadCurrentWeather(city);
    };

    li.querySelector("button").onclick = () => {
      favorites = favorites.filter(c => c !== city);
      saveData();
      renderFavorites();
    };

    favoritesList.appendChild(li);
  });
}

function getWeatherIcon(desc) {
  const text = desc.toLowerCase();

  if (text.includes("thunder")) return "/assets/lightning storm.jpg";
  if (text.includes("rain")) return "/assets/rain lightning storm.jpg";
  if (text.includes("overcast")) return "/assets/cloudy-overcast.jpg";
  if (text.includes("cloud")) return "/assets/partly-cloudy.png";
  return "/assets/sunny.jpg";
}

async function loadForecast(city) {
  if (!forecastContainer) return;

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${API_KEY}`
  );
  const data = await res.json();

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
}

if (searchBtn) {
  searchBtn.onclick = () => {
    currentCity = searchInput.value.trim();
    saveData();
    loadCurrentWeather(currentCity);
  };
}

if (favoriteBtn) {
  favoriteBtn.onclick = e => {
    e.preventDefault();
    e.stopPropagation();
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
