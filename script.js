    const forecastList = document.getElementById('forecast-list');
    const hourCondition = document.getElementById('hourCondition');
    const dayInfo = document.getElementById('dayInfo');
    const options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
    const optionsH = {hour: "numeric", minute: "2-digit"};
    const shortDate = {weekday: "short", year: "2-digit", month: "numeric", day: "numeric"};

    const weatherIcon = {
        "Rain": "wi wi-day-rain",
        "Clouds": "wi wi-day-cloudy",
        "Clear": "wi wi-day-sunny",
        "Snow": "wi wi-day-snow",
        "Mist": "wi wi-day-fog",
        "Drizzle": "wi wi-day-sleet",
    }

    function capitalize(str){
        return str[0].toUpperCase() + str.slice(1);
    }

    async function main(withIP = true){
        let ville;
        if(withIP){
            const ip = await fetch('https://api.ipify.org?format=json')
            .then(resultat => resultat.json())
            .then(json => json.ip)
            .catch(err => handleError(err));
    
            ville = await fetch('https://cors-anywhere.herokuapp.com/http://ip-api.com/json/' + ip)
            .then(resultat => resultat.json())
            .then(json => json.city)
            .catch(err => handleError(err));
            
        }else{
            ville = document.querySelector('#ville').textContent;
            
        }

        const data = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${ville}&appid=8340c20fbecf4c39e6dadd14cff9547b&lang=fr&units=metric`)
        .then(resultat => resultat.json())
        .then(json => json)
        .catch(err => handleError(err));

        updateView(data); 
    }

    function updateView(data){
        let html = "";
        html += updateCurrentView(data);
        html += updateForecastView(data);
        forecastList.innerHTML = html;
        const name = data.city.name;
        const conditions = data.list[0].weather[0].main;
        document.querySelector('#ville').textContent = name;
        document.querySelector('i.wi').className = weatherIcon[conditions];
        document.querySelector('.card').classList.add(conditions.toLowerCase());
        updateHourCondition(data);
    }

    function updateCurrentView(data){
        const temperature = data.list[0].main.temp;
        const description = data.list[0].weather[0].description;
        const wind = data.list[0].wind.speed;
        const todayNow = data.list[0].dt_txt;
        todayNow.replace(/[-]/g, "/");
        let nowDate = formatDate(todayNow, options);
        let nowHour = formatDate(todayNow, optionsH);
        let sunrise = data.city.sunrise;
        sunrise = new Date(sunrise * 1000);
        sunrise = new Intl.DateTimeFormat("fr-FR", optionsH).format(sunrise);
        let sunset = data.city.sunset;
        sunset = new Date(sunset * 1000);
        sunset = new Intl.DateTimeFormat("fr-FR", optionsH).format(sunset);
        return `
        <div class="carousel-item active mh-100">
            <div class="card w-100 text-white text-center p-4 h-100">
                <p id="city-condition" class="card-text text-center">${capitalize(description)}</p>
                <i class="wi"></i>
                <div class="card-body">
                    <i class="text-center wi wi-thermometer"> ${Math.round(temperature)}°C</i><br>
                    <i class="wi wi-strong-wind"> ${wind} km/h</i><br>
                    <i class="wi wi-sunrise"> ${sunrise} </i> &ensp;
                    <i class="wi wi-sunset"> ${sunset}</i>
                    <p id="day-time" class="text-center">${nowDate} à ${nowHour}</p>
                </div>
            </div> 
        </div>
        `;
    }

    function updateHourCondition(data){
        let html = "";
        let actualHour = new Date();
        let currentDate = new Intl.DateTimeFormat("fr-FR", options).format(actualHour);
        dayInfo.innerHTML = `Votre journée du ${currentDate}`;
        let hourNum = actualHour.getHours();
        let result = Math.floor(hourNum / 3);

        if(result < 8){
            result = 1;
        }
        
        for(result; result < 8; result++){
            html += createHourCondition(result, data);
            hourCondition.innerHTML = html;
        }
        return html;
    }

    function createHourCondition(result, data){
        const hour = Math.floor(result);
        let eachHourlyData = data.list[hour];
        let dayHour = eachHourlyData.dt_txt;
        let nowDate = formatDate(dayHour, shortDate);
        // let rep = /[\/]/gi ;
        // nowDate = nowDate.replace(rep, "-");
        let nowHour = formatDate(dayHour, optionsH);
        let eachTemp = eachHourlyData.main.temp;
        let eachCondition = eachHourlyData.weather[0].description;
        let eachIcon = eachHourlyData.weather[0].main;
        return `
            <div class="hour ${eachIcon.toLowerCase()} text-center text-white">
                <p class="mini">${nowDate} à ${nowHour}</p>
                <p>${Math.round(eachTemp)}°C</p>
                <i class="wi ${weatherIcon[eachIcon]}"></i>
                <p class="mini">${capitalize(eachCondition)}</p>
            </div>`;
    }

    function updateForecastView(data){
        let html = "";
        let dayNum = 0;
        for(let currentDay = 1; currentDay < 5; currentDay++){
            dayNum += 8;
            let condition2 = data.list[dayNum].weather[0].main;
            let currentData = data.list[dayNum];
            html += createForecastItemHtml(currentData, condition2);
        }
        return html;
    }

    function createForecastItemHtml(currentData, condition2){
        const thisDay = currentData;
        let dayIcon = currentData.weather[0].main;
        let thisCond = condition2.toLowerCase();
        let nowDate = thisDay.dt_txt;
        nowDate = formatDate(nowDate, options);
        let temperature = currentData.main.temp;
        let wind = currentData.wind.speed;
        return `
        <div class="carousel-item mh-100">
            <div class="card ${thisCond} w-100 text-white text-center p-4 h-100">
                <p id="city-conditiond2" class="card-text text-center">${capitalize(thisDay.weather[0].description)}</p>
                <i class="wi ${weatherIcon[dayIcon]}"></i>
                <div class="card-body">
                    <i class="text-center wi wi-thermometer"> ${Math.round(temperature)}°C</i><br>
                    <i class="wi wi-strong-wind"> ${wind} km/h</i><br>
                    <p id="day-time" class="text-center">${nowDate}</p>
                </div>
            </div>
        </div>`;
    }

    function handleError(err){
        console.error(err);
    }

    const ville = document.querySelector('#ville');
    ville.addEventListener('click', () => {
        ville.contentEditable = true;
    });
    ville.addEventListener('keydown', (e) => {
        if(e.keyCode === 13){
            e.preventDefault();
            ville.contentEditable = false;
            main(false);
        }
    })

    function formatDate(dateToFormat, option){
        const formated = new Date(dateToFormat);
        // let formatedDate = new Intl.DateTimeFormat("fr-FR", option).format(formated);
        let formatedDate = formated.toLocaleString('fr-FR', option);
        console.log(formatedDate);
        return formatedDate;
    }

    main();