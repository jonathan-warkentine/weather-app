# Weather App

👉 [This application is live!](https://jonathan-warkentine.github.io/weather-app/)

## Usage
![screenshot](./assets/images/demo.gif)

The app can be accessed via [the above-listed URL](https://jonathan-warkentine.github.io/weather-app/). 

When the app is loaded, the user is presented with a searchbar, any historical searches that a user has made (plus some default cities), as well as weather data for the last searched city -- both the current weather and an upcoming 5-day forecast overview. 

If a city is selected from the recent searches, that city's weather data is then displayed. If a new city is searched, that searched city's weather data is populated to the screen, and the city is saved as a recent search in the sidebar.

The user is able to toggle between imperial (Fahrenheit and mph) and metric (Celsius and m/s) by clicking on the toggle element.

## Features
This app features a few custom utility functions which can be repurposed endlessly, including the functions `storeLocally` and `retrieveLocal` that allow easy local storage reading and writing. The app features an easy "Celsius/Fahrenheit" toggle, and autocompletes from a list of capital cities and major US cities in the searchbar via the JQuery Autocomplete Widget. The app saves all searches to local storage, and all past searches can be re-selected.

## Pending Improvements
- [ ] interactive "x" that allows you to remove individual search history results
- [ ] "clear search history button"
- [ ] fix location of celsius/fahrenheit toggle
- [X] create a save function that takes two parameters: variable name to save to, data to save