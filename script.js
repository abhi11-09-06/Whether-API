 const API_KEY = '895284fb2d2c50a520ea537456963d9c';
        const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
        const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
        const AIR_QUALITY_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

        let isDarkMode = false;

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);

        function toggleTheme() {
            isDarkMode = !isDarkMode;
            const body = document.body;
            const themeIcon = document.querySelector('#themeToggle i');
            
            if (isDarkMode) {
                body.style.background = 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
                themeIcon.className = 'fas fa-sun';
            } else {
                body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                themeIcon.className = 'fas fa-moon';
            }
        }

        // Handle Enter key
        document.getElementById('cityInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getWeather();
            }
        });

        function showLoading() {
            document.getElementById('loading').classList.add('show');
            document.getElementById('weatherContent').classList.add('hidden');
            document.getElementById('error').style.display = 'none';
        }

        function hideLoading() {
            document.getElementById('loading').classList.remove('show');
        }

        function showError(message) {
            hideLoading();
            const errorEl = document.getElementById('error');
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            document.getElementById('weatherContent').classList.add('hidden');
        }

        function showWeather() {
            hideLoading();
            document.getElementById('weatherContent').classList.remove('hidden');
            document.getElementById('error').style.display = 'none';
        }

        async function getWeather() {
            const city = document.getElementById('cityInput').value.trim();
            if (!city) {
                showError('Please enter a city name');
                return;
            }

            showLoading();

            try {
                // Get current weather
                const weatherResponse = await fetch(`${WEATHER_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
                if (!weatherResponse.ok) {
                    throw new Error('City not found. Please check the spelling and try again.');
                }
                const weatherData = await weatherResponse.json();

                // Get forecast
                const forecastResponse = await fetch(`${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
                const forecastData = await forecastResponse.json();

                // Get air quality
                const aqResponse = await fetch(`${AIR_QUALITY_URL}?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`);
                const aqData = await aqResponse.json();

                displayWeather(weatherData);
                displayForecast(forecastData);
                displayAirQuality(aqData);
                showWeather();

            } catch (error) {
                showError(error.message);
            }
        }

        async function getCurrentLocation() {
            if (!navigator.geolocation) {
                showError('Geolocation is not supported by this browser.');
                return;
            }

            showLoading();

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;

                        const weatherResponse = await fetch(`${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
                        const weatherData = await weatherResponse.json();

                        const forecastResponse = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
                        const forecastData = await forecastResponse.json();

                        const aqResponse = await fetch(`${AIR_QUALITY_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
                        const aqData = await aqResponse.json();

                        displayWeather(weatherData);
                        displayForecast(forecastData);
                        displayAirQuality(aqData);
                        showWeather();

                    } catch (error) {
                        showError('Failed to get weather for your location');
                    }
                },
                (error) => {
                    showError('Unable to retrieve your location. Please try searching for a city instead.');
                }
            );
        }

        function searchCity(city) {
            document.getElementById('cityInput').value = city;
            getWeather();
        }

        function displayWeather(data) {
            document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
            
            const now = new Date();
            document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
            document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°`;
            document.getElementById('weatherDesc').textContent = data.weather[0].description;
            document.getElementById('feelsLike').textContent = `Feels like ${Math.round(data.main.feels_like)}°`;

            document.getElementById('humidity').textContent = `${data.main.humidity}%`;
            document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
            document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
            document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
            document.getElementById('uvIndex').textContent = 'N/A';

            const sunrise = new Date(data.sys.sunrise * 1000);
            const sunset = new Date(data.sys.sunset * 1000);
            document.getElementById('sunrise').textContent = sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            document.getElementById('sunset').textContent = sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        function displayForecast(data) {
            const hourlyContainer = document.getElementById('hourlyForecast');
            const hourlyData = data.list.slice(0, 8);
            
            hourlyContainer.innerHTML = hourlyData.map(item => {
                const date = new Date(item.dt * 1000);
                const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                return `
                    <div class="hourly-item">
                        <div class="hourly-time">${time}</div>
                        <img class="hourly-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="Weather">
                        <div class="hourly-temp">${Math.round(item.main.temp)}°</div>
                        <div class="hourly-desc">${item.weather[0].description}</div>
                    </div>
                `;
            }).join('');
        }

        function displayAirQuality(data) {
            const aqi = data.list[0].main.aqi;
            const aqiValue = document.getElementById('aqiValue');
            const aqiDesc = document.getElementById('aqiDesc');
            
            const aqiLevels = {
                1: { text: 'Good', class: 'aqi-good', desc: 'Air quality is satisfactory' },
                2: { text: 'Fair', class: 'aqi-fair', desc: 'Air quality is acceptable' },
                3: { text: 'Moderate', class: 'aqi-moderate', desc: 'Air quality is moderate' },
                4: { text: 'Poor', class: 'aqi-poor', desc: 'Air quality is poor' },
                5: { text: 'Very Poor', class: 'aqi-very-poor', desc: 'Air quality is very poor' }
            };
            
            const level = aqiLevels[aqi];
            aqiValue.textContent = level.text;
            aqiValue.className = `aqi-value ${level.class}`;
            aqiDesc.textContent = level.desc;
        }

        // Load default weather on page load
        window.addEventListener('load', () => {
            document.getElementById('cityInput').value = 'London';
            getWeather();
        });