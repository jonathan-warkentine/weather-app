setupPage();


// P A G E     S E T U P
function setupPage () {
    $("#date").text(moment().format("MMM Do, YYYY"));

    if (!localStorage.getItem("searchedCities")) { // In the absence of user data, provides a default list of searched cities
        localStorage.setItem("searchedCities", JSON.stringify(["Atlanta", "Denver", "New York City", "Houston"]));
    }

    writeSearchesFromHistory(JSON.parse(localStorage.getItem("searchedCities")));
}



/* U S E R      E V E N T S */
$("#searchform").on("submit", function(event){
    event.preventDefault();
    saveSearch($("#searchbar").val()); // Before executing search, saves query to local storage
    submitSearch($("#searchbar").val());
});

$(".search-history-item").on("click", function(event) { // User selects city from recent search history
    submitSearch(event.target.textContent);
});

$("#units-toggle").on("click", function(event){
    $("#units").text("Celsius");
})





/* S T A N D A L O N E      F U N C T I O N S */

function submitSearch (searchKey) { // Listen for search submission, return weather
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
            writeWeather(data);
        })
    });
}

function writeWeather (queryData) {
    console.log(queryData.current);
    $("#temperature").text(queryData.current.temp);
}

function writeSearchesFromHistory(searchedCities) { // Populates Recent Searches to Screen
    removeChildNodes(document.querySelector("#recents")); //removes all existing list items in order to start over
    for (let i=0; i<searchedCities.length; i++) { 
        let newCityEl = document.createElement("li");
        newCityEl.setAttribute("class", "list-group-item search-history-item");
        newCityEl.textContent = searchedCities[i];

        $("#recents").append(newCityEl);
    }
}

function saveSearch(searchText){ // Take a single parameter, "searchText", and unshifts to localStorage list of user searches 
    let currentLocalStorage = JSON.parse(localStorage.getItem("searchedCities"));
    currentLocalStorage.unshift(searchText); // updates search history to the currentLocalStorage variable
    writeSearchesFromHistory(currentLocalStorage); //repopulates page with updated search history
    localStorage.setItem("searchedCities", JSON.stringify(currentLocalStorage)); //saves updated search history to local storage

}

function removeChildNodes(parentEl){ //Deletes all children of the provided element
    while (parentEl.firstChild) {
        parentEl.removeChild(parentEl.firstChild);
    }
}