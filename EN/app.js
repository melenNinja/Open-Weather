let api_key = ""
async function GetAPI() {
    const api_key_Fetch = await fetch("../config.json")
    const api_res = await api_key_Fetch.json()
    api_key = api_res.API_KEY
    getWeatherInfo()
    getForecast();
}

GetAPI()

// Default city
let city = "Berlin"

// New city input
const newCityForm = document.querySelector(".newCityForm")
const newCity = document.querySelector(".newCity")
newCityForm.addEventListener("submit", e => {
    e.preventDefault()
    city = newCity.value
    getForecast()
    getWeatherInfo()
})

// Get date bar from HTML
const htmlDate = document.querySelector(".date")

// Load date/time
function loadDate(){
    const today = new Date();
    const weekday = {weekday: "long"};
    const weekdayName = today.toLocaleDateString("en-US", weekday)
    const day = today.getDate()
    const monthLong = {month: "long"};
    const month = today.toLocaleDateString("en-US", monthLong)
    const year = today.getFullYear()
    const dateStr = `${weekdayName}, ${day} ${month}, ${year} at ${(today.getHours()<10?"0":"") + today.getHours()}:${(today.getMinutes()<10?"0":"") + today.getMinutes()}`
    htmlDate.innerHTML = dateStr
}

loadDate()
// Update time every 15 seconds
setInterval(() => {loadDate()},15000)

// Get current weather data
const getWeatherInfo = async () => {
    const api_URL = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric&lang=en`
    const response = await fetch(api_URL);
    const data = await response.json();
    
    const dataContent = document.querySelector(".datacontent")

    // Reset boxes to default 3 to avoid duplication when showing rain
    dataContent.innerHTML = `<div class="box">
                    <div class="name">L / H</div>
                    <div class="data hilo">Loading... / Loading...</div>
                </div>
                <div class="box">
                    <div class="name">Humidity</div>
                    <div class="data hum">Loading...</div>
                </div>
                <div class="box">
                    <div class="name">Wind speed</div>
                    <div class="data windspeed">Loading... km/h</div>
                </div>`

    // Get HTML elements
    const currentWeather = document.querySelector(".gerade_wetter")
    const windSpeed = document.querySelector(".windspeed")
    const temp = document.querySelector(".temp")
    const tempFeeling = document.querySelector(".tempfeeling")
    const cityName = document.querySelector(".city")
    const hum = document.querySelector(".hum")
    
    // Fill data into HTML
    document.title = `Weather ${data.name}, ${data.sys.country}`
    hum.innerHTML = `${Math.round(data.main.humidity)}%` // Humidity
    temp.innerHTML = `${Math.round(data.main.temp)}°C` // Temperature
    tempFeeling.innerHTML = `${Math.round(data.main.feels_like)}°C` // Feels like
    currentWeather.innerHTML = data.weather[0].description // Weather description
    cityName.innerHTML = `${data.name}, ${data.sys.country}` // City, country
    windSpeed.innerHTML = `~${Math.round(data.wind.speed*3.6)} Km/h` // Wind speed
    if (data.rain) { // If rain, add rain box
        const rainValue = data.rain["1h"] || 0;
        dataContent.innerHTML += 
                `<div class="box">
                    <div class="name">Rain</div>
                    <div class="data">${rainValue} mm</div>
                </div>`
    }
}

const htmlForecast = document.querySelector(".forcast");
const getForecast = async () => {
    const api_forecast = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}&units=metric&lang=en`;
    const getfetch = await fetch(api_forecast);
    const forecastData = await getfetch.json();

    // Group data by day
    const grouped = {};
    forecastData.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
    });

    // Extract daily values + midday entry
    const dailyForecasts = Object.keys(grouped).slice(0, 5).map(date => {
        const temps = grouped[date].map(e => e.main);
        const min = Math.min(...temps.map(t => t.temp_min));
        const max = Math.max(...temps.map(t => t.temp_max));

        // Find midday entry (or first)
        const midday = grouped[date].find(e => e.dt_txt.includes("12:00:00")) || grouped[date][0];

        return {
            date,
            min,
            max,
            weather: midday.weather[0]
        };
    });

    // Map icon function
    function getLocalIcon(weatherMain) {
        switch (weatherMain) {
            case "Clear":
                return "../img/Sun.png";
            case "Clouds":
                return "../img/Cloud.png";
            case "Rain":
                return "../img/Rain.png";
            case "Drizzle":
                return "../img/Sun-Cloud-Rain.png";
            case "Thunderstorm":
                return "../img/Storm.png";
            case "Snow":
                return "../img/Snow.png";
            default:
                return "../img/Cloud.png";
        }
    }

    // Output HTML
    htmlForecast.innerHTML = "";

    const hilo = document.querySelector(".hilo")
    hilo.innerHTML = `${Math.round(dailyForecasts[0].min)}°C / ${Math.round(dailyForecasts[0].max)}°C` // min/max temperature

    dailyForecasts.forEach(day => {
        const iconUrl = getLocalIcon(day.weather.main);
        const dateObj = new Date(day.date);
        const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });

        htmlForecast.innerHTML += 
            `<div class="smallbox">
                <div class="forcastname">${weekday}</div>
                <div class="smallicon" style="background-image: url('${iconUrl}')" alt="${day.weather.description}"></div>
                <div class="hilo forcasttemp">${Math.round(day.min)}°C / ${Math.round(day.max)}°C</div>
                <div class="weather">${day.weather.description}</div>
            </div>`;
    });
};

// SETTINGS

const settingsButton = document.querySelector(".fa-gear")
let settingsOpen = true
const settingsPage = document.querySelector(".settings-tab")
settingsButton.addEventListener("click", ()=>{
    settingsOpen = !settingsOpen
        settingsPage.classList.toggle("hidden")
        settingsButton.classList.toggle("fa-gear-rot")
})

// Light/Dark theme
const lightMode = document.querySelector(".light-mode")
const darkMode = document.querySelector(".dark-mode")
const body = document.querySelector("body")

function modeSwitch(x) {
    if (x == true){
        body.classList.remove("darktheme")
    }
    else{
        body.classList.add("darktheme")
    }
}

modeSwitch(localStorage.getItem("darkmode")==="false")

lightMode.addEventListener("click", () => {
    modeSwitch(true)
    lightMode.style.backgroundColor = "hsl(0, 0%, 70%)"
    darkMode.style.backgroundColor = "hsl(0, 0%, 90%)"
    localStorage.setItem("darkmode", "false")
})
darkMode.addEventListener("click", () => {
    modeSwitch(false)
    lightMode.style.backgroundColor = "hsl(0, 0%, 10%)"
    darkMode.style.backgroundColor = "hsl(0, 0%, 0%)"
    localStorage.setItem("darkmode", "true")
})

if (localStorage.getItem("darkmode") === "true"){
    lightMode.style.backgroundColor = "hsl(0, 0%, 10%)"
    darkMode.style.backgroundColor = "hsl(0, 0%, 0%)"
}
else{
    lightMode.style.backgroundColor = "hsl(0, 0%, 70%)"
    darkMode.style.backgroundColor = "hsl(0, 0%, 90%)"
}
