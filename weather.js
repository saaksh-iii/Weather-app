// Weather App JavaScript


const API_KEY = 'e138c30c1f59054e038b2ba337ed509c'; 
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM Elements
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const weatherContainer = document.getElementById('weather-container');
const forecastContainer = document.getElementById('forecast-container');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const loadingIndicator = document.getElementById('loading');
const themeToggle = document.getElementById('theme-toggle');

// Weather display elements
const locationElement = document.getElementById('location');
const dateElement = document.getElementById('date');
const weatherIconElement = document.getElementById('weather-icon');
const temperatureElement = document.getElementById('temperature');
const weatherConditionElement = document.getElementById('weather-condition');
const feelsLikeElement = document.getElementById('feels-like');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');
const forecastCardsElement = document.getElementById('forecast-cards');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Check for saved location
    const savedLocation = localStorage.getItem('lastLocation');
    if (savedLocation) {
        locationInput.value = savedLocation;
        getWeatherData(savedLocation);
    }
});

searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location) {
        getWeatherData(location);
    }
});

locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const location = locationInput.value.trim();
        if (location) {
            getWeatherData(location);
        }
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
});

// Functions
async function getWeatherData(location) {
    showLoading();
    hideError();
    weatherContainer.style.display = 'none';
    forecastContainer.style.display = 'none';
    
    try {
        // Get current weather data
        const weatherResponse = await fetch(`${WEATHER_API_URL}?q=${location}&appid=${API_KEY}&units=metric`);
        
        if (!weatherResponse.ok) {
            throw new Error('City not found');
        }
        
        const weatherData = await weatherResponse.json();
        
        // Get forecast data
        const forecastResponse = await fetch(`${FORECAST_API_URL}?q=${location}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();
        
        // Update UI with weather data
        updateWeatherUI(weatherData);
        updateForecastUI(forecastData);
        
        // Save location to localStorage
        localStorage.setItem('lastLocation', location);
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function updateWeatherUI(data) {
    // Update location and date
    locationElement.textContent = `${data.name}, ${data.sys.country}`;
    dateElement.textContent = formatDate(new Date());
    
    // subtle animation effect
    weatherContainer.classList.add('animate-weather');
    
    // Update temperature and condition
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    weatherConditionElement.textContent = data.weather[0].description;
    
    // Update weather icon
    weatherIconElement.innerHTML = getWeatherIcon(data.weather[0].id);
    
    // Update additional metrics
    feelsLikeElement.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidityElement.textContent = `${data.main.humidity}%`;
    windSpeedElement.textContent = `${data.wind.speed} m/s`;
    pressureElement.textContent = `${data.main.pressure} hPa`;
    
    // Show weather container
    weatherContainer.style.display = 'block';
}

function updateForecastUI(data) {
    // Clear previous forecast cards
    forecastCardsElement.innerHTML = '';
    
    // Get forecast for next 5 days (every 24 hours)
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
    
    // Create forecast cards
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(forecast.main.temp);
        const weatherId = forecast.weather[0].id;
        const weatherIcon = getWeatherIcon(weatherId);
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${weatherIcon}</div>
            <div class="forecast-temp">${temp}°C</div>
        `;
        
        forecastCardsElement.appendChild(forecastCard);
    });
    
    // Show forecast container
    forecastContainer.style.display = 'block';
}

function getWeatherIcon(weatherId) {
    // Map weather condition codes to Font Awesome icons
    if (weatherId >= 200 && weatherId < 300) {
        return '<i class="fas fa-bolt"></i>'; // Thunderstorm
    } else if (weatherId >= 300 && weatherId < 400) {
        return '<i class="fas fa-cloud-rain"></i>'; // Drizzle
    } else if (weatherId >= 500 && weatherId < 600) {
        return '<i class="fas fa-cloud-showers-heavy"></i>'; // Rain
    } else if (weatherId >= 600 && weatherId < 700) {
        return '<i class="fas fa-snowflake"></i>'; // Snow
    } else if (weatherId >= 700 && weatherId < 800) {
        return '<i class="fas fa-smog"></i>'; // Atmosphere (fog, mist, etc.)
    } else if (weatherId === 800) {
        return '<i class="fas fa-sun"></i>'; // Clear sky
    } else if (weatherId > 800) {
        return '<i class="fas fa-cloud"></i>'; // Clouds
    } else {
        return '<i class="fas fa-question"></i>'; // Unknown
    }
}

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function showLoading() {
    loadingIndicator.style.display = 'block';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message || 'An error occurred. Please try again.';
    errorContainer.style.display = 'block';
    weatherContainer.style.display = 'none';
    forecastContainer.style.display = 'none';
    
    // Shake animation for error
    errorContainer.classList.add('shake');
    setTimeout(() => {
        errorContainer.classList.remove('shake');
    }, 500);
}

function hideError() {
    errorContainer.style.display = 'none';
}