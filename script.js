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
    
            ville = await fetch('http://ip-api.com/json/' + ip)
            .then(resultat => resultat.json())
            .then(json => json.city)
            .catch(ville => defaultCity(ville))
        }else{
            ville = document.querySelector('#ville').textContent;
        }

        const meteo = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${ville}&appid=8340c20fbecf4c39e6dadd14cff9547b&lang=fr&units=metric`)
        .then(resultat => resultat.json())
        .then(json => json)
        updateView(meteo)  
        console.log(ville);          
    }

    function updateView(data){
        let html = "";
        html += updateCurrentView(data);
        html += updateForecastView(data);
        forecastList.innerHTML = html;
        updateHourCondition(data);
        const name = data.city.name;
        const conditions = data.list[0].weather[0].main;
        document.querySelector('#ville').textContent = name;
        document.querySelector('i.wi').className = weatherIcon[conditions];
        document.body.className = conditions.toLowerCase();
        document.querySelector('.card').classList.add(conditions.toLowerCase());
    }

    function updateCurrentView(data){
        const temperature = data.list[0].main.temp;
        const description = data.list[0].weather[0].description;
        const tempMax = data.list[0].main.temp_max;
        const tempMin = data.list[0].main.temp_min;
        const wind = data.list[0].wind.speed;
        return `
        <div class="carousel-item active d-flex">
            <div class="card d-block w-100 text-white text-center p-4">
                <p id="city-condition" class="card-text text-center">${capitalize(description)}</p>
                <i class="wi"></i>
                <div class="card-body">
                    <i class="text-center wi wi-thermometer"> ${Math.round(temperature)}°C</i>
                    <p id="cityTempAll" class="text-center">Mini : ${Math.round(tempMin)}°C</p>
                    <p>Maxi : ${Math.round(tempMax)}°C</p>
                    <i class="wi wi-strong-wind"> ${wind} km/h</i>
                    <p id="day-time" class="text-center">${data.list[0].dt_txt}</p>
                </div>
            </div> 
        </div>
        `;
    }

    function updateHourCondition(data){
        let html = "";
        let actualHour = new Date();
        let options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
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
        let eachTemp = eachHourlyData.main.temp;
        let eachCondition = eachHourlyData.weather[0].description;
        let eachIcon = eachHourlyData.weather[0].main;
         
        return `
            <div class="hour text-center text-white">
                <p>${dayHour}</p>
                <p>${eachTemp}°C</p>
                <i class="wi ${weatherIcon[eachIcon]}"></i>
                <p>${eachCondition}</p>
            </div>`;
    }

    function updateForecastView(data){
        let html = "";
        let dayNum = 0;
        for(let currentDay = 1; currentDay < 5; currentDay++){
            dayNum += 8;
            let condition2 = data.list[dayNum].weather[0].main;
            html += createForecastItemHtml(data, dayNum, condition2);
        }

        return html;
    }

    function createForecastItemHtml(data, dayNum, condition2){
        const thisDay = data.list[dayNum];
        let dayIcon = data.list[dayNum].weather[0].main;
        let thisCond = condition2.toLowerCase();
        return `
        <div class="carousel-item w-100">
            <div class="card ${thisCond} d-block w-100 text-white text-center">
                <p id="city-conditiond2" class="card-text text-center">${capitalize(thisDay.weather[0].description)}</p>
                <i class="wi ${weatherIcon[dayIcon]}"></i>
                <div class="card-body">
                    <p id="city-tempd2" class="text-center">Temp mini : ${Math.round(thisDay.main.temp_min)} °C</p>
                    <p id="city-tempd22" class="text-center">Temp max : ${Math.round(thisDay.main.temp_max)} °C</p>
                    <p id="day-timed2" class="text-center">${thisDay.dt_txt}</p>
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

    function defaultCity(ville){
        ville = 'la valette-du-var';
        return ville;
    }

    main();