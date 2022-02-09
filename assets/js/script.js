var token = config.API_Key;

setupPage();

/* U S E R      E V E N T S */
$("#searchform").on("submit", function(event){ // User submits a search
    event.preventDefault(); // Prevent page reload
    saveLocally("searchedCities", $("#searchbar").val(), false); // Before executing search, saves query to local storage
    displayPreviousSearches(JSON.parse(localStorage.getItem("searchedCities"))); // Displays search in sidebar
    fetchWeatherData($("#searchbar").val()); // Executes user search event
});

$("#recents").on("click", function(event) { // User selects city from recent search history
    event.stopPropagation();
    
    fetchWeatherData(event.target.textContent);
    
    $("#cityName").text(event.target.textContent);
});

$("#units-toggle").on("click", function(event){
    event.stopPropagation();
    toggleUnits();
    refreshPage();
});


/* F U N C T I O N S */
function setupPage () {
    $("#date").text(moment().format("MMM Do, YYYY"));
    $("#units").val("imperial"); // Sets the default temperature units to Fahrenheit

    saveLocally("searchedCities", retrieveLocal("searchedCities") || ["Atlanta", "Denver", "New York City", "Houston"], true);
    
    displayPreviousSearches(retrieveLocal("searchedCities"));
    fetchWeatherData(retrieveLocal("searchedCities", 0));
}

function displayPreviousSearches(searchedCities) { // Populates Recent Searches to Screen
    removeChildNodes(document.querySelector("#recents"), 0); //removes all existing list items in order to start over
    for (let i=0; i<searchedCities.length; i++) { 
        
        let newCityEl = document.createElement("li");
        
        newCityEl.textContent = searchedCities[i];

        newCityEl.setAttribute("class", "list-group-item search-history-item");
        
        $("#recents").append(newCityEl);
    }
}

function fetchWeatherData (searchKey) { // Listen for search submission, return weather

    $("#cityName").text(searchKey); // Write the queried city name to the header

    // Uses the OpenWeather Geocoding API to fetch lattitude and longitude for a given city name (https://openweathermap.org/api/geocoding-api)
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchKey}&limit=1&appid=${token}`) 
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        let lattitude = data[0].lat;
        let longitude = data[0].lon;

        // Uses the OpenWeather OneCall API and lattitude and longitude from the fetch above to return weather data for the searched city (https://openweathermap.org/api/one-call-api)
        fetch(`https://api.openweathermap.org/data/2.5/onecall?units=${$("#units").val()}&lat=${lattitude}&lon=${longitude}&exclude=minutely,hourly&appid=${token}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            writeWeather(data);
        })
        .catch( function(error){
            alert(error);
        })
    })
    .catch( function(error){
        alert(error);
    });
}

function writeWeather (queryData) {
    console.log(queryData);
    
    // Write the Main Weather Card with Current Weather
    $("#weatherIcon").attr("src", `https://openweathermap.org/img/wn/${queryData.daily[0].weather[0].icon}@2x.png`);
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
        forecastDayCardEl.attr("style", "display: inline;");
        forecastDayCardEl.find(".card-title").text(moment.unix(queryData.daily[i].dt).format("MMM Do"));
        
        let newListItemEl = document.createElement("li");
        newListItemEl.textContent = `${Math.round(queryData.daily[i].temp.day)}° ${$("#units").text()}`;
        forecastDayCardEl.find(".card-attributes").append(newListItemEl);

        newListItemEl = document.createElement("li");
        newListItemEl.textContent = `Wind: ${Math.round(queryData.daily[i].wind_speed)} ${$("#speedUnits").text()}`;
        forecastDayCardEl.find(".card-attributes").append(newListItemEl);

        newListItemEl = document.createElement("li");
        newListItemEl.textContent = `Humidity: ${queryData.daily[i].humidity}%`;
        forecastDayCardEl.find(".card-attributes").append(newListItemEl);

        forecastDayCardEl.find(".card-icon").attr("src", `https://openweathermap.org/img/wn/${queryData.daily[i].weather[0].icon}@2x.png`);
        
        $("#five-day-forecast").append(forecastDayCardEl);
    }
}

function refreshPage () {
    displayPreviousSearches(JSON.parse(localStorage.getItem("searchedCities")));
    fetchWeatherData($("#cityName").text());
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

// UTILITY FUNCTIONS
function saveLocally (varName, varValue, override){ 
    if (override) {
        localStorage.setItem(varName, JSON.stringify(varValue));
    }
    else {
        let currentLocalStorage = JSON.parse(localStorage.getItem(varName)) || [];
        currentLocalStorage.unshift(varValue);  
        localStorage.setItem(varName, JSON.stringify(currentLocalStorage));
    }
}

function retrieveLocal(varName, index){
    let localItem = JSON.parse(localStorage.getItem(varName));
    if (index != null) {
        return localItem[index];
    }
    else {
        return localItem;
    }
}

function removeChildNodes(parentEl, indexStart){ //Deletes all children of the provided element, starting with the last element, until the provided number of elements remain
    while (parentEl.childNodes.length > indexStart) {
        parentEl.removeChild(parentEl.lastChild);
    }
}


/* JQuery Autocomplete Widget*/
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
        "Harare",
        "Aberdeen", "Abilene", "Akron", "Albany", "Albuquerque", "Alexandria", "Allentown", "Amarillo", "Anaheim", "Anchorage", "Ann Arbor", "Antioch", "Apple Valley", "Appleton", "Arlington", "Arvada", "Asheville", "Athens", "Atlanta", "Atlantic City", "Augusta", "Aurora", "Austin", "Bakersfield", "Baltimore", "Barnstable", "Baton Rouge", "Beaumont", "Bel Air", "Bellevue", "Berkeley", "Bethlehem", "Billings", "Birmingham", "Bloomington", "Boise", "Boise City", "Bonita Springs", "Boston", "Boulder", "Bradenton", "Bremerton", "Bridgeport", "Brighton", "Brownsville", "Bryan", "Buffalo", "Burbank", "Burlington", "Cambridge", "Canton", "Cape Coral", "Carrollton", "Cary", "Cathedral City", "Cedar Rapids", "Champaign", "Chandler", "Charleston", "Charlotte", "Chattanooga", "Chesapeake", "Chicago", "Chula Vista", "Cincinnati", "Clarke County", "Clarksville", "Clearwater", "Cleveland", "College Station", "Colorado Springs", "Columbia", "Columbus", "Concord", "Coral Springs", "Corona", "Corpus Christi", "Costa Mesa", "Dallas", "Daly City", "Danbury", "Davenport", "Davidson County", "Dayton", "Daytona Beach", "Deltona", "Denton", "Denver", "Des Moines", "Detroit", "Downey", "Duluth", "Durham", "El Monte", "El Paso", "Elizabeth", "Elk Grove", "Elkhart", "Erie", "Escondido", "Eugene", "Evansville", "Fairfield", "Fargo", "Fayetteville", "Fitchburg", "Flint", "Fontana", "Fort Collins", "Fort Lauderdale", "Fort Smith", "Fort Walton Beach", "Fort Wayne", "Fort Worth", "Frederick", "Fremont", "Fresno", "Fullerton", "Gainesville", "Garden Grove", "Garland", "Gastonia", "Gilbert", "Glendale", "Grand Prairie", "Grand Rapids", "Grayslake", "Green Bay", "GreenBay", "Greensboro", "Greenville", "Gulfport-Biloxi", "Hagerstown", "Hampton", "Harlingen", "Harrisburg", "Hartford", "Havre de Grace", "Hayward", "Hemet", "Henderson", "Hesperia", "Hialeah", "Hickory", "High Point", "Hollywood", "Honolulu", "Houma", "Houston", "Howell", "Huntington", "Huntington Beach", "Huntsville", "Independence", "Indianapolis", "Inglewood", "Irvine", "Irving", "Jackson", "Jacksonville", "Jefferson", "Jersey City", "Johnson City", "Joliet", "Kailua", "Kalamazoo", "Kaneohe", "Kansas City", "Kennewick", "Kenosha", "Killeen", "Kissimmee", "Knoxville", "Lacey", "Lafayette", "Lake Charles", "Lakeland", "Lakewood", "Lancaster", "Lansing", "Laredo", "Las Cruces", "Las Vegas", "Layton", "Leominster", "Lewisville", "Lexington", "Lincoln", "Little Rock", "Long Beach", "Lorain", "Los Angeles", "Louisville", "Lowell", "Lubbock", "Macon", "Madison", "Manchester", "Marina", "Marysville", "McAllen", "McHenry", "Medford", "Melbourne", "Memphis", "Merced", "Mesa", "Mesquite", "Miami", "Milwaukee", "Minneapolis", "Miramar", "Mission Viejo", "Mobile", "Modesto", "Monroe", "Monterey", "Montgomery", "Moreno Valley", "Murfreesboro", "Murrieta", "Muskegon", "Myrtle Beach", "Naperville", "Naples", "Nashua", "Nashville", "New Bedford", "New Haven", "New London", "New Orleans", "New York", "New York City", "Newark", "Newburgh", "Newport News", "Norfolk", "Normal", "Norman", "North Charleston", "North Las Vegas", "North Port", "Norwalk", "Norwich", "Oakland", "Ocala", "Oceanside", "Odessa", "Ogden", "Oklahoma City", "Olathe", "Olympia", "Omaha", "Ontario", "Orange", "Orem", "Orlando", "Overland Park", "Oxnard", "Palm Bay", "Palm Springs", "Palmdale", "Panama City", "Pasadena", "Paterson", "Pembroke Pines", "Pensacola", "Peoria", "Philadelphia", "Phoenix", "Pittsburgh", "Plano", "Pomona", "Pompano Beach", "Port Arthur", "Port Orange", "Port Saint Lucie", "Port St. Lucie", "Portland", "Portsmouth", "Poughkeepsie", "Providence", "Provo", "Pueblo", "Punta Gorda", "Racine", "Raleigh", "Rancho Cucamonga", "Reading", "Redding", "Reno", "Richland", "Richmond", "Richmond County", "Riverside", "Roanoke", "Rochester", "Rockford", "Roseville", "Round Lake Beach", "Sacramento", "Saginaw", "Saint Louis", "Saint Paul", "Saint Petersburg", "Salem", "Salinas", "Salt Lake City", "San Antonio", "San Bernardino", "San Buenaventura", "San Diego", "San Francisco", "San Jose", "Santa Ana", "Santa Barbara", "Santa Clara", "Santa Clarita", "Santa Cruz", "Santa Maria", "Santa Rosa", "Sarasota", "Savannah", "Scottsdale", "Scranton", "Seaside", "Seattle", "Sebastian", "Shreveport", "Simi Valley", "Sioux City", "Sioux Falls", "South Bend", "South Lyon", "Spartanburg", "Spokane", "Springdale", "Springfield", "St. Louis", "St. Paul", "St. Petersburg", "Stamford", "Sterling Heights", "Stockton", "Sunnyvale", "Syracuse", "Tacoma", "Tallahassee", "Tampa", "Temecula", "Tempe", "Thornton", "Thousand Oaks", "Toledo", "Topeka", "Torrance", "Trenton", "Tucson", "Tulsa", "Tuscaloosa", "Tyler", "Utica", "Vallejo", "Vancouver", "Vero Beach", "Victorville", "Virginia Beach", "Visalia", "Waco", "Warren", "Washington", "Waterbury", "Waterloo", "West Covina", "West Valley City", "Westminster", "Wichita", "Wilmington", "Winston", "Winter Haven", "Worcester", "Yakima", "Yonkers", "York", "Youngstown"
    ];
    $('#searchbar').autocomplete({
      source: cityNames,
    });
  });