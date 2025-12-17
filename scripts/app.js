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
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`);
        const data = await res.json();
        if (data.cod !== 200) throw new Error();

        cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
        conditionEl.textContent = data.weather[0].description;
        temperatureEl.textContent = `${Math.round(data.main.temp_max)}° / ${Math.round(data.main.temp_min)}°`;
        humidityEl.textContent = `${data.main.humidity}%`;
        windEl.textContent = `${data.wind.speed} mph`;
    } catch {
        cityNameEl.textContent = "City not found";
        conditionEl.textContent = "--";
        temperatureEl.textContent = "-- / --";
        humidityEl.textContent = "--";
        windEl.textContent = "--";
    }
}

function renderFavorites() {
    if (!favoritesList) return;
    favoritesList.innerHTML = "";
    favorites.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;
        li.onclick = () => {
            currentCity = city;
            saveData();
            loadCurrentWeather(city);
        };
        favoritesList.appendChild(li);
    });
}

async function loadForecast(city) {
    if (!forecastContainer) return;
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${API_KEY}`);
        const data = await res.json();
        if (data.cod !== "200") throw new Error();

        forecastCityEl.textContent = `${data.city.name} 5-Day Forecast`;
        forecastContainer.innerHTML = "";

        const seen = {};
        const fiveDays = data.list.filter(item => {
            const date = item.dt_txt.split(" ")[0];
            if (!seen[date]) {
                seen[date] = true;
                return true;
            }
            return false;
        }).slice(0, 5);

        fiveDays.forEach(day => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <div class="card-info">
                    <div class="day">${new Date(day.dt_txt).toLocaleDateString("en-US",{ weekday: "short" })}</div>
                    <div class="desc">${day.weather[0].description}</div>
                    <div class="temp">${Math.round(day.main.temp_max)}° / ${Math.round(day.main.temp_min)}°</div>
                </div>
            `;
            forecastContainer.appendChild(card);
        });
    } catch {
        forecastContainer.innerHTML = "<p>Could not load forecast</p>";
    }
}

if (searchBtn && searchInput) {
    searchBtn.onclick = () => {
        const city = searchInput.value.trim();
        if (!city) return;
        currentCity = city;
        saveData();
        loadCurrentWeather(city);
    };

    searchInput.onkeydown = (e) => {
        if (e.key === "Enter") searchBtn.onclick();
    };
}

if (favoriteBtn) {
    favoriteBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!favorites.includes(currentCity)) {
            favorites.push(currentCity);
            saveData();
            renderFavorites();
        }
    };
}

if (cityNameEl) {
    renderFavorites();
    loadCurrentWeather(currentCity);
}

if (forecastContainer) {
    loadForecast(currentCity);
}
