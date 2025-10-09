let api_key = ""
async function GetAPI() {
    const api_key_Fetch = await fetch("../config.json")
    const api_res = await api_key_Fetch.json()
    api_key = api_res.API_KEY
    getWheaterInfo()
    getforcast();
}

GetAPI()

//Standart ort
let city = "Berlin"


//setting neuer ort eingabe
const newCityForm = document.querySelector(".newCityForm")
const newCity = document.querySelector(".newCity")
newCityForm.addEventListener("submit", e => {
    e.preventDefault()
    city = newCity.value
    getforcast()
    getWheaterInfo()
})


//die Leiste für die Zeit angabe aus dem html raussuchen
const htmldate = document.querySelector(".date")

//Das Laden von den Datum/Zeit abrufen
function DatumLaden(){
    const heute = new Date();
    const wochentag = {weekday: "long",};
    const uebersetzungwochentage = heute.toLocaleDateString("de-DE",wochentag)
    const tag = heute.getDate()
    const monthlong = {month: "long",};
    const month = heute.toLocaleDateString("de-DE", monthlong)
    const year = heute.getFullYear()
    const datum = `${uebersetzungwochentage}, ${tag} ${month}, ${year} um ${(heute.getHours()<10?"0":"") + heute.getHours()}:${(heute.getMinutes()<10?"0":"") + heute.getMinutes()}`
    htmldate.innerHTML = datum
}


DatumLaden()
//Die Zeit aktuallisieren, jede 1/4 Minute
setInterval(() => {DatumLaden()},15000)

//Ruft Die TagesDaten Ab
 const getWheaterInfo = async () => {
    const api_URL = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric&lang=de`
    const antwort = await fetch(api_URL);
    const data = await antwort.json();
    
    const datacontent = document.querySelector(".datacontent")

    //Setzt die Kästen auf die Standart 3 Käsen zurück um verdopplung bei regen anzeige zu vermeiden
    datacontent.innerHTML = `<div class="box">
                    <div class="name">T / H</div>
                    <div class="data hilo">Loading... / Loading...</div>
                </div>
                <div class="box">
                    <div class="name">Luftfeuchtigkeit</div>
                    <div class="data hum">Loading...</div>
                </div>
                <div class="box">
                    <div class="name">Wind Geschwindigkeit</div>
                    <div class="data windspeed">Loading... km/h</div>
                </div>`

    //HTML Dokument abfangen
    const gerade_wetter = document.querySelector(".gerade_wetter")
    const windspeed = document.querySelector(".windspeed")
    const rain = document.querySelector(".rain")
    const temp = document.querySelector(".temp")
    const tempfeeling = document.querySelector(".tempfeeling")
    const cityname = document.querySelector(".city")
    const hum = document.querySelector(".hum")
    

    //Fügt Die Daten in das HTML Dokument Hinzu
    document.title = `Wetter ${data.name}, ${data.sys.country}`
    hum.innerHTML = `${Math.round(data.main.humidity)}%` //Luftfeuchtigkei
    temp.innerHTML = `${Math.round(data.main.temp)}°C`// temperatur
    tempfeeling.innerHTML = `${Math.round(data.main.feels_like)}°C` //gefühlt wie viel Grad
    gerade_wetter.innerHTML = data.weather[0].description //Wetterbeschreibung
    cityname.innerHTML = `${data.name}, ${data.sys.country}` //Landangabe z.b. DE, GB etc.
    windspeed.innerHTML = `~${Math.round(data.wind.speed*3.6)} Km/h` //Windgeschwindigkeit Gerundet auf km/h
    if (data.rain) { //Falls regen vorhanden erstellt es ein neuen kasten mit den regen daten
        const rainValue = data.rain["1h"] || 0;
        datacontent.innerHTML += 
                `<div class="box">
                    <div class="name">Regen</div>
                    <div class="data">${rainValue} mm</div>
                </div>`
    }
}

const htmlforcast = document.querySelector(".forcast");
const getforcast = async () => {
    const api_forcast = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}&units=metric&lang=de`;
    const getfetch = await fetch(api_forcast);
    const forcastdata = await getfetch.json();

    // Daten pro Tag gruppieren
    const grouped = {};
    forcastdata.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
    });

    // Echte Tageswerte + Mittagsdatensatz extrahieren
    const dailyForecasts = Object.keys(grouped).slice(0, 5).map(date => {
        const temps = grouped[date].map(e => e.main);
        const min = Math.min(...temps.map(t => t.temp_min));
        const max = Math.max(...temps.map(t => t.temp_max));

        // Einen mittäglichen Eintrag finden (oder ersten nehmen)
        const midday = grouped[date].find(e => e.dt_txt.includes("12:00:00")) || grouped[date][0];

        return {
            date,
            min,
            max,
            weather: midday.weather[0]
        };
    });

    // Icon-Funktion mappen
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

    // HTML ausgeben
    htmlforcast.innerHTML = "";

    const hilo = document.querySelector(".hilo")
    hilo.innerHTML = `${Math.round(dailyForecasts[0].min)}°C / ${Math.round(dailyForecasts[0].max)}°C`//max/min temperatur

    dailyForecasts.forEach(day => {
        const iconUrl = getLocalIcon(day.weather.main);
        const dateObj = new Date(day.date);
        const weekday = dateObj.toLocaleDateString("de-DE", { weekday: "long" });

        htmlforcast.innerHTML += 
            `<div class="smallbox">
                <div class="forcastname">${weekday}</div>
                <div class="smallicon" style="background-image: url('${iconUrl}')" alt="${day.weather.description}"></div>
                <div class="hilo forcasttemp">${Math.round(day.min)}°C / ${Math.round(day.max)}°C</div>
                <div class="weather">${day.weather.description}</div>
            </div>`;
    });
};



//SETTINGS

const settingsbutton = document.querySelector(".fa-gear")
let settings_open = true
const settingspage = document.querySelector(".settings-tab")
settingsbutton.addEventListener("click", ()=>{
    settings_open = !settings_open
        settingspage.classList.toggle("hidden")
        settingsbutton.classList.toggle("fa-gear-rot")
})

// Light/Dark theme
const lightmode = document.querySelector(".light-mode")
const darkmode = document.querySelector(".dark-mode")
const body = document.querySelector("body")


function Modeswitch(x) {
if (x == true){
    body.classList.remove("darktheme")
}
else{
    body.classList.add("darktheme")
}
}


Modeswitch(localStorage.getItem("darkmode")==="false")

lightmode.addEventListener("click", () => {
    Modeswitch(true)
    lightmode.style.backgroundColor = "hsl(0, 0%, 70%)"
    darkmode.style.backgroundColor = "hsl(0, 0%, 90%)"
    localStorage.setItem("darkmode", "false")
})
darkmode.addEventListener("click", () => {
    Modeswitch(false)
    lightmode.style.backgroundColor = "hsl(0, 0%, 10%)"
    darkmode.style.backgroundColor = "hsl(0, 0%, 0%)"
    localStorage.setItem("darkmode", "true")
})

if (localStorage.getItem("darkmode") === "true"){
    lightmode.style.backgroundColor = "hsl(0, 0%, 10%)"
    darkmode.style.backgroundColor = "hsl(0, 0%, 0%)"
}
else{
    lightmode.style.backgroundColor = "hsl(0, 0%, 70%)"
    darkmode.style.backgroundColor = "hsl(0, 0%, 90%)"
}
