setupPage();


// P A G E     S E T U P
function setupPage () {
    $("#date").text(moment().format("MMM Do, YYYY"));

    if (!localStorage.getItem("searchedCities")) { // In the absence of user data, provides a default list of searched cities
        localStorage.setItem("searchedCities", JSON.stringify(["Atlanta", "Denver", "New York City", "Houston"]));
    }

    writeSearchHistory(JSON.parse(localStorage.getItem("searchedCities")));
}



/* U S E R      E V E N T S */
$("#searchform").on("submit", function(event){
    event.preventDefault();
    saveSearch($("#searchbar").val()); // Before executing search, saves query to local storage
    submitSearch($("#searchbar").val());
});

$(".search-history-item").on("click", function(event) {
    submitSearch(event.target.textContent);
});





/* S T A N D A L O N E      F U N C T I O N S */


function submitSearch (searchKey) { // Listen for search submission, return weather

    console.log(searchKey);

    
    // Uses the OpenWeather Geocoding API to fetch lattitude and longitude for a given city name (https://openweathermap.org/api/geocoding-api)
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchKey}&limit=1&appid=964a555e6e9097dea02c021683c83267`)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        let lattitude = data[0].lat;
        let longitude = data[0].lon;

        // Uses the OpenWeather OneCall API and lattitude and longitude from the fetch above to return weather data for the searched city (https://openweathermap.org/api/one-call-api)
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lattitude}&lon=${longitude}&exclude=minutely,hourly&appid=964a555e6e9097dea02c021683c83267`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data.current);
        })
    });
}

function writeSearchHistory(searchedCities) { // Populates Recent Searches to Screen
    
    for (let i=0; i<searchedCities.length; i++) { 
        let newCityEl = document.createElement("li");
        newCityEl.setAttribute("class", "list-group-item search-history-item");
        newCityEl.textContent = searchedCities[i];

        $("#recents").append(newCityEl);
    }
}

function saveSearch(searchText){ // Takes 1 parameter, "searchText", and unshifts to localStorage list of user searches 
    let currentLocalStorage = JSON.parse(localStorage.getItem("searchedCities"));
    currentLocalStorage.unshift(searchText);
    localStorage.setItem("searchedCities", JSON.stringify(currentLocalStorage));
}

