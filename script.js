/* API key for OpenWeatherMap API */
const API_KEY = '895284fb2d2c50a520ea537456963d9c';

/* Base URLs for OpenWeatherMap API endpoints */
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'; /* Current weather data */
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'; /* 5-day/3-hour forecast data */
const AIR_QUALITY_URL = 'https://api.openweathermap.org/data/2.5/air_pollution'; /* Air quality data */

/* Tracks the current theme (light or dark) */
let isDarkMode = false;

/* Event listener for theme toggle button */
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

/* Toggles between light and dark themes */
function toggleTheme() {
    isDarkMode = !isDarkMode; /* Flip the theme state */
    const body = document.body; /* Reference to the body element */
    const themeIcon = document.querySelector('#themeToggle i'); /* Theme toggle icon */
    
    if (isDarkMode) {
        /* Apply dark theme */
        body.style.background = 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'; /* Dark gradient background */
        themeIcon.className = 'fas fa-sun'; /* Change icon to sun */
    } else {
        /* Apply light theme */
        body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; /* Light gradient background */
        themeIcon.className = 'fas fa-moon'; /* Change icon to moon */
    }
}

/* Event listener for Enter key in the city input field */
document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getWeather(); /* Trigger weather fetch when Enter is pressed */
    }
});

/* Shows the loading spinner */
function showLoading() {
    document.getElementById('loading').classList.add('show'); /* Display loading indicator */
    document.getElementById('weatherContent').classList.add('hidden'); /* Hide weather content */
    document.getElementById('error').style.display = 'none'; /* Hide error message */
}

/* Hides the loading spinner */
function hideLoading() {
    document.getElementById('loading').classList.remove('show'); /* Remove loading indicator */
}

/* Displays an error message */
function showError(message) {
    hideLoading(); /* Hide loading spinner */
    const errorEl = document.getElementById('error'); /* Error message element */
    errorEl.textContent = message; /* Set error message */
    errorEl.style.display = 'block'; /* Show error message */
    document.getElementById('weatherContent').classList.add('hidden'); /* Hide weather content */
}

/* Shows the weather content */
function showWeather() {
    hideLoading(); /* Hide loading spinner */
    document.getElementById('weatherContent').classList.remove('hidden'); /* Show weather content */
    document.getElementById('error').style.display = 'none'; /* Hide error message */
}

/* Fetches and displays weather data for a given city */
async function getWeather() {
    const city = document.getElementById('cityInput').value.trim(); /* Get city input value */
    if (!city) {
        showError('Please enter a city name'); /* Show error if input is empty */
        return;
    }

    showLoading(); /* Show loading spinner */

    try {
        /* Fetch current weather data */
        const weatherResponse = await fetch(`${WEATHER_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
        if (!weatherResponse.ok) {
            throw new Error('City not found. Please check the spelling and try again.'); /* Handle invalid city */
        }
        const weatherData = await weatherResponse.json(); /* Parse weather data */

        /* Fetch 5-day/3-hour forecast data */
        const forecastResponse = await fetch(`${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json(); /* Parse forecast data */

        /* Fetch air quality data using coordinates from weather data */
        const aqResponse = await fetch(`${AIR_QUALITY_URL}?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`);
        const aqData = await aqResponse.json(); /* Parse air quality data */

        /* Display the fetched data */
        displayWeather(weatherData);
        displayForecast(forecastData);
        displayAirQuality(aqData);
        showWeather(); /* Show the weather content */

    } catch (error) {
        showError(error.message); /* Display error if any API call fails */
    }
}

/* Fetches weather data using the user's geolocation */
async function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser.'); /* Handle unsupported geolocation */
        return;
    }

    showLoading(); /* Show loading spinner */

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const lat = position.coords.latitude; /* Get latitude */
                const lon = position.coords.longitude; /* Get longitude */

                /* Fetch current weather data using coordinates */
                const weatherResponse = await fetch(`${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
                const weatherData = await weatherResponse.json(); /* Parse weather data */

                /* Fetch forecast data using coordinates */
                const forecastResponse = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
                const forecastData = await forecastResponse.json(); /* Parse forecast data */

                /* Fetch air quality data using coordinates */
                const aqResponse = await fetch(`${AIR_QUALITY_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
                const aqData = await aqResponse.json(); /* Parse air quality data */

                /* Display the fetched data */
                displayWeather(weatherData);
                displayForecast(forecastData);
                displayAirQuality(aqData);
                showWeather(); /* Show the weather content */

            } catch (error) {
                showError('Failed to get weather for your location'); /* Handle API errors */
            }
        },
        (error) => {
            showError('Unable to retrieve your location. Please try searching for a city instead.'); /* Handle geolocation errors */
        }
    );
}

/* Sets the city input and fetches weather data for a predefined city */
function searchCity(city) {
    document.getElementById('cityInput').value = city; /* Set city input value */
    getWeather(); /* Fetch weather data */
}

/* Displays current weather data */
function displayWeather(data) {
    /* Display city name and country */
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    
    const now = new Date(); /* Current date and time */
    /* Format and display date and time */
    document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    /* Set weather icon */
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    /* Display temperature */
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°`;
    /* Display weather description */
    document.getElementById('weatherDesc').textContent = data.weather[0].description;
    /* Display feels-like temperature */
    document.getElementById('feelsLike').textContent = `Feels like ${Math.round(data.main.feels_like)}°`;

    /* Display additional weather details */
    document.getElementById('humidity').textContent = `${data.main.humidity}%`; /* Humidity */
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`; /* Pressure */
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`; /* Wind speed */
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`; /* Visibility in kilometers */
    document.getElementById('uvIndex').textContent = 'N/A'; /* UV Index (not provided by API) */

    /* Convert and display sunrise time */
    const sunrise = new Date(data.sys.sunrise * 1000);
    document.getElementById('sunrise').textContent = sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    /* Convert and display sunset time */
    const sunset = new Date(data.sys.sunset * 1000);
    document.getElementById('sunset').textContent = sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/* Displays 24-hour forecast data */
function displayForecast(data) {
    const hourlyContainer = document.getElementById('hourlyForecast'); /* Forecast container */
    const hourlyData = data.list.slice(0, 8); /* Take first 8 entries (24 hours) */
    
    /* Generate HTML for hourly forecast items */
    hourlyContainer.innerHTML = hourlyData.map(item => {
        const date = new Date(item.dt * 1000); /* Convert timestamp to date */
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); /* Format time */
        
        return `
            <div class="hourly-item">
                <div class="hourly-time">${time}</div>
                <img class="hourly-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="Weather">
                <div class="hourly-temp">${Math.round(item.main.temp)}°</div>
                <div class="hourly-desc">${item.weather[0].description}</div>
            </div>
        `;
    }).join(''); /* Join HTML strings */
}

/* Displays air quality data */
function displayAirQuality(data) {
    const aqi = data.list[0].main.aqi; /* Get air quality index */
    const aqiValue = document.getElementById('aqiValue'); /* AQI value element */
    const aqiDesc = document.getElementById('aqiDesc'); /* AQI description element */
    
    /* Define AQI levels with corresponding text, CSS class, and description */
    const aqiLevels = {
        1: { text: 'Good', class: 'aqi-good', desc: 'Air quality is satisfactory' },
        2: { text: 'Fair', class: 'aqi-fair', desc: 'Air quality is acceptable' },
        3: { text: 'Moderate', class: 'aqi-moderate', desc: 'Air quality is moderate' },
        4: { text: 'Poor', class: 'aqi-poor', desc: 'Air quality is poor' },
        5: { text: 'Very Poor', class: 'aqi-very-poor', desc: 'Air quality is very poor' }
    };
    
    const level = aqiLevels[aqi]; /* Get AQI level data */
    aqiValue.textContent = level.text; /* Set AQI text */
    aqiValue.className = `aqi-value ${level.class}`; /* Apply AQI class */
    aqiDesc.textContent = level.desc; /* Set AQI description */
}

/* Load default weather for London when the page loads */
window.addEventListener('load', () => {
    document.getElementById('cityInput').value = 'London'; /* Set default city */
    getWeather(); /* Fetch weather data */
});
