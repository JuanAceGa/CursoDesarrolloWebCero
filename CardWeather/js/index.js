// De esta manera se auto-ejecutara la 
// funcion, esta dentro del parentesis 
// para que sea globar
(function()
{
	var API_WEATHER_KEY = "80114c7878f599621184a687fc500a12";
	var API_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + 
			API_WEATHER_KEY + "&";
	var IMG_WEATHER = "http://openweathermap.org/img/w/";

	var API_WORLDTIME_KEY = "d6a4075ceb419113c64885d9086d5";
	var API_WORLDTIME_URL = "http://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key=" + 
			API_WORLDTIME_KEY + "&q=";

	var cities = [];
	var cityWeather = {};
	cityWeather.zone;
	cityWeather.icon;
	cityWeather.temp;
	cityWeather.temp_max;
	cityWeather.temp_min;
	cityWeather.main;

	var tiempo = new Date();

	var $body = $("body");
	var $loader = $(".loader");
	var newCiudad = $("[data-city='cityAdd']");
	var btnAdd = $("[data-btn]");
	var btnLoad = $("[data-saved-cities]");

	$(btnAdd).on("click", addNewCity);

	$(newCiudad).on("keypress", function (event) {
		if(event.which == 13)
		{
			addNewCity(event);
		}
	});

	$(btnLoad).on("click", loadSavedCities);

	if(navigator.geolocation)
	{
		navigator.geolocation
			.getCurrentPosition(getCoords, errorFound);
	}
	else
	{
		alert("¡Por favor actualiza tu navegador!.");
	}

	function errorFound(error)
	{
		alert("Un error ocurrió: " + error.code);
		// 0: Error desconocido
		// 1: Permiso denegado
		// 2: Posición no está disponible
		// 3: Timeout
	}

	function getCoords(position)
	{
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;

		console.log("Tu posición es: " + lat + ", " + lon);

		$.getJSON(API_WEATHER_URL + "lat=" + lat + "&lon=" + lon, getCurrentWeather);
	}
		
	function getCurrentWeather(data)
	{
		cityWeather.zone = data.name;
		cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
		cityWeather.temp = data.main.temp - 273.15;
		cityWeather.temp_max = data.main.temp_max - 273.15;
		cityWeather.temp_min = data.main.temp_min - 273.15;
		cityWeather.main = data.weather[0].main;

		//render
		renderTemplate(cityWeather);
	}

	function activateTemplate(id)
	{
		var t = document.querySelector(id);

		return document.importNode(t.content, true);
	}

	function renderTemplate(cityWeather, localTime)
	{
		var clone = activateTemplate("#template--city");

		var timeToShow;

		if(localTime)
		{
			timeToShow = localTime.split(" ")[1];
		}
		else
		{
			timeToShow = tiempo.toLocaleTimeString();
		}

		clone.querySelector("[data-time]").innerHTML = timeToShow;
		clone.querySelector("[data-city]").innerHTML = cityWeather.zone;
		clone.querySelector("[data-icon]").src = cityWeather.icon;
		clone.querySelector("[data-temp='max']").innerHTML = cityWeather.temp_max.toFixed(1) + "°C";
		clone.querySelector("[data-temp='min']").innerHTML = cityWeather.temp_min.toFixed(1) + "°C";
		clone.querySelector("[data-temp='current']").innerHTML = cityWeather.temp.toFixed(1) + "°C";

		$($loader).hide();
		$($body).append(clone);
	}

	function addNewCity(event)
	{
		event.preventDefault();

		$.getJSON(API_WEATHER_URL + "q=" + $(newCiudad).val(), getWeatherNewCity);
	}

	function getWeatherNewCity(data)
	{
		$.getJSON(API_WORLDTIME_URL + $(newCiudad).val(), function (response){
			
			$(newCiudad).val("");

			cityWeather = {};
			cityWeather.zone = data.name;
			cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
			cityWeather.temp = data.main.temp - 273.15;
			cityWeather.temp_max = data.main.temp_max - 273.15;
			cityWeather.temp_min = data.main.temp_min - 273.15;
			cityWeather.main = data.weather[0].main;

			renderTemplate(cityWeather, response.data.time_zone[0].localtime);

			cities.push(cityWeather);
			localStorage.setItem("cities", JSON.stringify(cities));
		});
	}

	function loadSavedCities(event)
	{
		event.preventDefault();

		function renderCities(cities)
		{
			cities.forEach(function (city){
				renderTemplate(city);
			});
		};

		var cities = JSON.parse(localStorage.getItem("cities"));
		renderCities(cities);
	}

})();