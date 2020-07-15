    const forecastList = document.getElementById('forecast-list');
    const hourCondition = document.getElementById('hourCondition');
    const dayInfo = document.getElementById('dayInfo');
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
    
            ville = await fetch('https://freegeoip.app/json/' + ip)
            .then(resultat => resultat.json())
            .then(json => json.city)
        }else{
            ville = document.querySelector('#ville').textContent;
        }

        const meteo = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ville}&appid=8340c20fbecf4c39e6dadd14cff9547b&lang=fr&units=metric`)
        .then(resultat => resultat.json())
        .then(json => json)
        console.log(meteo);
        updateView(meteo)            
    }

    function updateView(data){
        let html = "";
        html += updateCurrentView(data);
        // html += updateForecastView(data);
        forecastList.innerHTML = html;
        // updateHourCondition(data);
        const name = data.name;
        const conditions = data.weather[0].main;
        document.querySelector('#ville').textContent = name;
        document.querySelector('i.wi').className = weatherIcon[conditions];
        document.body.className = conditions.toLowerCase();
        document.querySelector('.card').classList.add(conditions.toLowerCase());

    }

    function updateCurrentView(data){
        const temperature = data.main.temp;
        const description = data.weather[0].description;
        const tempMax = data.main.temp_max;
        const tempMin = data.main.temp_min;
        const wind = data.wind.speed;
        return `
        <div class="carousel-item active d-flex">
            <div class="card d-block w-100 text-white text-center">
                <p id="city-condition" class="card-text text-center">${capitalize(description)}</p>
                <i class="wi"></i>
                <div class="card-body">
                    <p id="city-temp" class="text-center">${Math.round(temperature)}°C</p>
                    <p id="cityTempAll" class="text-center">Mini : ${Math.round(tempMin)}°C</p>
                    <p>Maxi : ${Math.round(tempMax)}°C</p>
                    <p>Vitesse du vent ${wind} km/h</p>
                    <p id="day-time" class="text-center"></p>
                </div>
            </div> 
        </div>
        `;
    }

    function updateHourCondition(data){
        let html = "";
        dayInfo.innerHTML = `Votre journée du ${data.fcst_day_0.day_long} ${data.current_condition.date}`;
        let actualHour = new Date();
        
        for(let hourNum = actualHour.getHours(); hourNum < 24; hourNum++){
            html += createHourCondition(hourNum, data);
            if(hourNum > 18){
                hourCondition.className += ' justify-content-center';
                }
                else{
                    hourCondition.className += ' justify-content-between';
                };
            hourCondition.innerHTML = html;
        }
        
        return html;
    }

    function createHourCondition(hourNum, data){
        const hour = hourNum + "H00";
        let eachHourlyData = data.fcst_day_0.hourly_data[hour];
        let eachTemp = eachHourlyData['TMP2m'];
        let eachCondition = eachHourlyData['CONDITION'];
        let eachIcon = eachHourlyData['ICON'];
         
        return `
                <div class="hour bg-dark text-center text-white">
                    <p>${hour}</p>
                    <p>${eachTemp}°C</p>
                    <img class="smallIcon" src="${eachIcon}">
                    <p>${eachCondition}</p>
                </div>`;
    }

    function updateForecastView(data){
        let html = "";
        for(let dayNum = 1; dayNum <= 4; dayNum++){
            html += createForecastItemHtml(data, dayNum);
        }
        return html;
    }

    function createForecastItemHtml(data, dayNum){
        const dayKey = "fcst_day_" + dayNum;
        const dayData = data[dayKey];
        return `
        <div class="carousel-item w-100">
            <div class="card d-block w-100 text-white text-center">
                <p id="city-conditiond2" class="card-text text-center">${dayData.condition}</p>
                <img src="${dayData.icon_big}" class="card-img-top icon" alt="condition météo">
                <div class="card-body">
                    <p id="city-tempd2" class="text-center">Temp mini : ${dayData.tmin} °C</p>
                    <p id="city-tempd22" class="text-center">Temp max : ${dayData.tmax} °C</p>
                    <p id="day-timed2" class="text-center">${dayData.day_long} ${dayData.date}</p>
                </div>
            </div>
        </div>`;
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

    main();