const apiKey = '2bd141af61149fc473b4d651a72b25b7';
const randomCities = ['Kyiv', 'Lviv', 'Odesa', 'Dnipro', 'Kharkiv'];
let shiftPCount = 0;

$(document).ready(function() {
    showRandomCitiesWeather();
    setupAutocomplete();
    setupEventListeners();
    setupFeedbackForm();
    setupAdminAccess();
    loadNews();
});

function setupAutocomplete() {
    $("#cityInput").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: `http://api.openweathermap.org/geo/1.0/direct?q=${request.term}&limit=10&appid=${apiKey}`,
                dataType: "json",
                success: function(data) {
                    const filteredData = data.filter(item => item.country === 'UA')
                                             .map(item => ({
                                                 label: `${item.local_names?.uk || item.name}, ${item.state || ''}, Україна`,
                                                 value: item.local_names?.uk || item.name,
                                                 lat: item.lat,
                                                 lon: item.lon,
                                                 state: item.state || '',
                                                 country: item.country
                                             }));
                    response(filteredData);
                }
            });
        },
        select: function(event, ui) {
            const city = ui.item.value;
            const lat = ui.item.lat;
            const lon = ui.item.lon;
            displayWeatherCity(city);
            getWeather(lat, lon, 3);  // Initially display 3 days
        },
        minLength: 1
    });
}

function setupEventListeners() {
    document.getElementById('getWeatherBtn').addEventListener('click', function() {
        const cityInput = document.getElementById('cityInput').value.trim();
        if (cityInput) {
            getCoordinates(cityInput, 3);  // Initially display 3 days
        } else {
            document.getElementById('weatherInfo').innerHTML = '<p class="text-danger">Будь ласка, введіть назву міста.</p>';
        }
    });

    $('.days-btn').click(function() {
        $('.days-btn').removeClass('active');
        $(this).addClass('active');
        const cityInput = document.getElementById('cityInput').value.trim();
        if (cityInput) {
            const days = $(this).val();
            getCoordinates(cityInput, days);
        }
    });

    $('#managePostsBtn').click(function() {
        window.location.href = 'manage_posts.html';
    });
}

function setupFeedbackForm() {
    $('#feedbackForm').submit(function(event) {
        event.preventDefault();
        const email = $('#email').val();
        const message = $('#feedbackMessage').val();
        window.location.href = `mailto:kostakovalenko7@gmail.com?subject=Website%20Feedback&body=Email:%20${email}%0D%0AMessage:%20${message}`;
    });
}

function setupAdminAccess() {
    $(document).keydown(function(event) {
        if (event.key === 'P' && event.shiftKey) {
            shiftPCount++;
            if (shiftPCount === 3) {
                $('#adminLogin').show();
                shiftPCount = 0; // Reset the counter
            }
        } else {
            shiftPCount = 0; // Reset the counter if other keys are pressed
        }
    });
}

function showRandomCitiesWeather() {
    const randomCityIndexes = [];
    while (randomCityIndexes.length < 3) {
        const randomIndex = Math.floor(Math.random() * randomCities.length);
        if (!randomCityIndexes.includes(randomIndex)) {
            randomCityIndexes.push(randomIndex);
        }
    }
    randomCityIndexes.forEach(index => {
        getCoordinates(randomCities[index], 1, true);
    });
}

function getCoordinates(city, days, isInitialLoad = false) {
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},UA&limit=1&appid=${apiKey}`;
    toggleLoading(true);

    fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            toggleLoading(false);
            if (data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;
                displayWeatherCity(city);
                getWeather(lat, lon, days, city, isInitialLoad);
            } else {
                document.getElementById('weatherInfo').innerHTML = '<p class="text-danger">Місто не знайдено</p>';
            }
        })
        .catch(error => {
            toggleLoading(false);
            console.error('Error:', error);
            document.getElementById('weatherInfo').innerHTML = '<p class="text-danger">Помилка отримання даних. Спробуйте ще раз пізніше.</p>';
        });
}

function displayWeatherCity(city) {
    document.getElementById('weatherCity').innerHTML = `<h2>Прогноз погоди для ${city}</h2>`;
}

function getWeather(lat, lon, days, city, isInitialLoad = false) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ua&cnt=${days * 8}`;
    toggleLoading(true);

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            toggleLoading(false);
            if (data.cod === '200') {
                let weatherInfo = '';

                const dailyData = {};
                
                data.list.forEach(entry => {
                    const date = new Date(entry.dt * 1000).toLocaleDateString('uk-UA');
                    if (!dailyData[date]) {
                        dailyData[date] = [];
                    }
                    dailyData[date].push(entry);
                });

                const dates = Object.keys(dailyData).slice(0, days);

                dates.forEach(date => {
                    const entries = dailyData[date];
                    const avgTemp = entries.reduce((sum, entry) => sum + entry.main.temp, 0) / entries.length;
                    let weatherIcon = entries[0].weather[0].icon;
                    const weatherDescription = entries[0].weather[0].description;

                    if (weatherIcon.endsWith('n')) {
                        weatherIcon = weatherIcon.replace('n', 'd');
                    }

                    weatherInfo += `
                        <div class="weather-day">
                            <h3>${date}</h3>
                            <img src="http://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${weatherDescription}">
                            <div class="temperature">${avgTemp.toFixed(1)} °C</div>
                            <p>${weatherDescription}</p>
                            <div class="details">
                                <div>
                                    <p>Вологість</p>
                                    <p>${entries[0].main.humidity}%</p>
                                </div>
                                <div>
                                    <p>Вітер</p>
                                    <p>${entries[0].wind.speed} м/с</p>
                                </div>
                            </div>
                        </div>
                    `;
                });

                document.getElementById('weatherInfo').innerHTML = weatherInfo;
            } else {
                document.getElementById('weatherInfo').innerHTML = `<p class="text-danger">${data.message}</p>`;
            }
        })
        .catch(error => {
            toggleLoading(false);
            console.error('Error:', error);
            document.getElementById('weatherInfo').innerHTML = '<p class="text-danger">Помилка отримання даних. Спробуйте ще раз пізніше.</p>';
        });
}

function toggleLoading(show) {
    document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
}

function loadNews() {
    const news = JSON.parse(localStorage.getItem('news')) || [];
    displayNews(news);
}

function displayNews(news) {
    const newsContent = document.getElementById('newsContent');
    newsContent.innerHTML = '';
    news.forEach((item, index) => {
        const newsElement = document.createElement('div');
        newsElement.classList.add('news-item');
        newsElement.setAttribute('data-index', index);
        newsElement.innerHTML = `
            <img src="${item.images[0]}" alt="Новина зображення">
            <h3>${item.title}</h3>
            <p class="news-date">${item.date}</p>
        `;
        newsElement.addEventListener('click', function() {
            displayNewsModal(index);
        });
        newsContent.appendChild(newsElement);
    });
}

function displayNewsModal(index) {
    const news = JSON.parse(localStorage.getItem('news')) || [];
    const newsItem = news[index];
    const modalContent = `
        <h3>${newsItem.title}</h3>
        ${newsItem.images.map(image => `<img src="${image}" alt="Новина зображення">`).join('')}
        <p>${newsItem.content}</p>
        <p class="news-date">${newsItem.date}</p>
    `;
    $('#newsModal .modal-content .modal-body').html(modalContent);
    $('#newsModal').modal('show');
}
