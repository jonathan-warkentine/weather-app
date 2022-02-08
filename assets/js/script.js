setupPage();


/* U S E R      E V E N T S */
$("#searchform").on("submit", function(event){
    event.preventDefault();
    saveSearch($("#searchbar").val()); // Before executing search, saves query to local storage
    

    executeSearch($("#searchbar").val()); // Executes user search event
});

$("#recents").on("click", "span", function(event) { // User selects city from recent search history
    event.stopPropagation();
    
    executeSearch(event.target.textContent);
    
    $("#cityName").text(event.target.textContent);
});

$("#recents").on("click", "li", function(event) { // User selects city from recent search history
    event.target.remove();

});

$("#units-toggle").on("click", function(event){
    event.stopPropagation();
    toggleUnits();
});


/* F U N C T I O N S */

function setupPage () {
    $("#date").text(moment().format("MMM Do, YYYY"));
    $("#units").val("imperial"); // Sets the default temperature units to Fahrenheit

    if (!localStorage.getItem("searchedCities")) { // In the absence of user data, provides a default list of searched cities
        localStorage.setItem("searchedCities", JSON.stringify(["Atlanta", "Denver", "New York City", "Houston"]));
    }

    writeSearchesFromHistory(JSON.parse(localStorage.getItem("searchedCities")));
    
    mostRecentSearch = JSON.parse(localStorage.getItem("searchedCities"));
    mostRecentSearch = mostRecentSearch[0];
    executeSearch(mostRecentSearch);
}

function executeSearch (searchKey) { // Listen for search submission, return weather
    
    $("#cityName").text(searchKey);

    // Uses the OpenWeather Geocoding API to fetch lattitude and longitude for a given city name (https://openweathermap.org/api/geocoding-api)
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchKey}&limit=1&appid=964a555e6e9097dea02c021683c83267`) 
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        let lattitude = data[0].lat;
        let longitude = data[0].lon;

        // Uses the OpenWeather OneCall API and lattitude and longitude from the fetch above to return weather data for the searched city (https://openweathermap.org/api/one-call-api)
        fetch(`https://api.openweathermap.org/data/2.5/onecall?units=${$("#units").val()}&lat=${lattitude}&lon=${longitude}&exclude=minutely,hourly&appid=964a555e6e9097dea02c021683c83267`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            writeWeather(data);
        })
        
        
    });

}

function writeWeather (queryData) {
    console.log(queryData);
    
    // Write the Main Weather Card with Current Weather
    $("#weatherIcon").attr("src", `http://openweathermap.org/img/wn/${queryData.daily[0].weather[0].icon}@2x.png`);
    $("figcaption").text(queryData.daily[0].weather[0].description);
    $("#temperature").text(`${Math.round(queryData.current.temp)}° ${$("#units").text()}`);
    $("#windSpeed").text(`${queryData.current.wind_speed} `);
    $("#humidity").text(queryData.current.humidity);
    $("#uv-index").text(queryData.current.uvi);
    uvColorCode($("#uv-index"), queryData.current.uvi)

    // Write the 5 Day Forecast
    removeChildNodes(document.querySelector("#five-day-forecast"), 2);
    for (let i=1; i<6; i++){
        let forecastDayCardEl = $("#card-template").clone();
        forecastDayCardEl.attr("style", "display: inline-block;");
        forecastDayCardEl.find(".card-title").text(moment.unix(queryData.daily[i].dt).format("MMM Do"));
        
        forecastDayCardEl.find(".card-attributes").append();
        let newListItemEl = document.createElement("li");
        newListItemEl.textContent = `${Math.round(queryData.daily[i].temp.day)}° ${$("#units").text()}`;
        forecastDayCardEl.find(".card-attributes").append(newListItemEl);

        newListItemEl = document.createElement("li");
        newListItemEl.textContent = `Wind: ${queryData.daily[i].wind_speed} ${$("#speedUnits").text()}`;
        forecastDayCardEl.find(".card-attributes").append(newListItemEl);

        newListItemEl = document.createElement("li");
        newListItemEl.textContent = `Humidity: ${queryData.daily[i].humidity}%`;
        forecastDayCardEl.find(".card-attributes").append(newListItemEl);

        forecastDayCardEl.find(".card-icon").attr("src", `http://openweathermap.org/img/wn/${queryData.daily[i].weather[0].icon}@2x.png`);
        
        $("#five-day-forecast").append(forecastDayCardEl);
    }
}

function writeSearchesFromHistory(searchedCities) { // Populates Recent Searches to Screen
    removeChildNodes(document.querySelector("#recents"), 0); //removes all existing list items in order to start over
    for (let i=0; i<searchedCities.length; i++) { 
        
        let newCityEl = document.createElement("span");
        let closeEl = document.createElement("li");
        
        newCityEl.textContent = searchedCities[i];


        closeEl.textContent = "x";
        closeEl.setAttribute("class", "list-group-item search-history-item");
        closeEl.setAttribute("style", "display: flex; flex-flow: row-reverse nowrap; justify-content: space-between;");
        
        closeEl.appendChild(newCityEl);

        $("#recents").append(closeEl);
    }
}

function saveSearch(searchText){ // Take a single parameter, "searchText", and unshifts to localStorage list of user searches 
    
    let currentLocalStorage = JSON.parse(localStorage.getItem("searchedCities"));
    currentLocalStorage.unshift(searchText); // updates search history to the currentLocalStorage variable
    writeSearchesFromHistory(currentLocalStorage); //repopulates page with updated search history
    
    localStorage.setItem("searchedCities", JSON.stringify(currentLocalStorage)); //saves updated search history to local storage

}

function toggleUnits(){
    if ($("#units").text() == "Celsius"){
        $("#units").text("Fahrenheit");
        $("#units").val("imperial");
        $("#speedUnits").text("mph");
    }
    else {
        $("#units").text("Celsius");
        $("#units").val("metric");
        $("#speedUnits").text("m/s");
    }

    executeSearch($("#cityName").text());
}

function removeChildNodes(parentEl, indexStart){ //Deletes all children of the provided element, starting with the last element, until the provided number of elements remain
    
    while (parentEl.childNodes.length > indexStart) {
        parentEl.removeChild(parentEl.lastChild);
    }
    
    // for (let i=indexStart; i<parentEl.childNodes.length; i++) {
    //     parentEl.removeChild(parentEl.lastChild);
    // }
}

function uvColorCode (uvIndexEl, uv_index){ // Severity guide and colors sourced from the AT Melanoma Foundation: https://www.aimatmelanoma.org/melanoma-101/prevention/what-is-ultraviolet-uv-radiation/#:~:text=UV%20Index%200%2D2%20means,harm%20from%20unprotected%20sun%20exposure.
    if (uv_index < 3){
        uvIndexEl.attr("style", "background-color: #289500;");
    }
    else if (uv_index < 6){
        uvIndexEl.attr("style", "background-color: #f7e400;");
    }
    else if (uv_index < 8){
        uvIndexEl.attr("style", "background-color: #f85900;");
    }
    else if (uv_index < 11) {
        uvIndexEl.attr("style", "background-color: #d80010;");
    }
    else {
        uvIndexEl.attr("style", "background-color: #6b49c8;");
    }
}


/* JQuery Autocomplete */


$(function () {
    var cityNames = [
        "Kabul",
        "Tirane",
        "Algiers",
        "Andorra la vella",
        "Luanda",
        "Saint john's",
        "Buenos aires",
        "Yerevan",
        "Canberra",
        "Vienna",
        "Baku",
        "Nassau",
        "Manama",
        "Dhaka",
        "Bridgetown",
        "Minsk",
        "Brussels",
        "Belmopan",
        "Porto-novo",
        "Thimphu",
        "La paz, sucre",
        "Sarajevo",
        "Gaborone",
        "Brasilia",
        "Bandar seri begawan",
        "Sofia",
        "Ouagadougou",
        "Bujumbura",
        "Phnom penh",
        "Yaounde",
        "Ottawa",
        "Praia",
        "Bangui",
        "N'djamena",
        "Santiago",
        "Beijing",
        "Bogota",
        "Moron",
        "Kinshasa",
        "Brazzaville",
        "San jose",
        "Yamoussoukro, abidjan",
        "Zagreb",
        "Havana",
        "Nicosia",
        "Prague",
        "Copenhagen",
        "Djibouti",
        "Rosesau",
        "Santo domingo",
        "Dilli",
        "Quito",
        "Cairo",
        "San salvador",
        "Malabo",
        "Asmara",
        "Tallinn",
        "Addis ababa",
        "Suva",
        "Helsinki",
        "Paris",
        "Libreville",
        "Banjul",
        "Tbilisi",
        "Berlin",
        "Accra",
        "Athens",
        "St. george's",
        "Guatemala city",
        "Conakry",
        "Bissau",
        "Georgetown",
        "Port-au-prince",
        "Tegucigalpa",
        "Budapest",
        "Reykjavik",
        "New delhi",
        "Jakarta",
        "Tehran",
        "Baghdad",
        "Dublin",
        "Jerusalem",
        "Rome",
        "Kingston",
        "Tokyo",
        "Amman",
        "Astana",
        "Nairobi",
        "Tarawa atoll",
        "Pyongyang",
        "Seoul",
        "Pristina",
        "Kuwait city",
        "Bishkek",
        "Vientiane",
        "Riga",
        "Beirut",
        "Maseru",
        "Monrovia",
        "Tripoli",
        "Vaduz",
        "Vilnius",
        "Luxembourg",
        "Skopje",
        "Antananarivo",
        "Lilongwe",
        "Kuala lumpur",
        "Male",
        "Bamako",
        "Valletta",
        "Majuro",
        "Nouakchott",
        "Port louis",
        "Mexico city",
        "Palikir",
        "Chisinau",
        "Monaco",
        "Ulaanbaatar",
        "Podgorica",
        "Rabat",
        "Maputo",
        "Nypyidaw",
        "Windhoek",
        "Yaren",
        "Kathmandu",
        "Amsterdam, the hague",
        "Wellington",
        "Managua",
        "Niamey",
        "Abuja",
        "Oslo",
        "Muscat",
        "Islamabad",
        "Melekeok",
        "Panama city",
        "Port moresby papa",
        "Asuncion",
        "Lima",
        "Manila",
        "Warsaw",
        "Lisbon",
        "Doha",
        "Bucharest",
        "Moscow",
        "Kigali",
        "Basseterre",
        "Castries",
        "Kingstown east",
        "Apia",
        "San marino",
        "Sao tome",
        "Riyadh",
        "Dakar",
        "Belgrade",
        "Victoria",
        "Freetown",
        "Singapore",
        "Bratislava",
        "Ljubljana",
        "Honiara",
        "Mogadishu",
        "Pretoria, cape town,bloemfontein",
        "Juba",
        "Madrid",
        "Colombo",
        "Khartoum",
        "Paramaribo",
        "Mbabane",
        "Stockholm",
        "Berne",
        "Damascus",
        "Taipei",
        "Dushanbe",
        "Dar es salaam, dodoma",
        "Bangkok",
        "Lome",
        "Nuku'alofa",
        "Port-of-spain",
        "Tunis",
        "Ankara",
        "Ashgabat",
        "Vaiaku",
        "Kampala",
        "Kiev",
        "Abu dhabi",
        "London",
        "Washington d.c.",
        "Montevideo",
        "Tashkent",
        "Port-vila",
        "Vatican city",
        "Caracas",
        "Hanoi",
        "Sanaa",
        "Lusaka",
        "Harare"
    ];
    $('#searchbar').autocomplete({
      source: cityNames,
    });
  });
 