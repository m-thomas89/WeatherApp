// List of variables going to be used
var city="";
var sCity = $("#search-city");
var sButton = $("#search-button");
var cButton = $("#clear-history");
var cCity = $("#current-city");
var cTemp = $("#temperature");
var cHumidity= $("#humidity");
var cWSpeed=$("#wind-speed");
var cUVIndex= $("#uv-index");
var cCity=[];
// searches the city to see if it exists in the entries from the storage
function find(c){
    for (var i=0; i<cCity.length; i++){
        if(c.toUpperCase()===cCity[i]){
            return -1;
        }
    }
    return 1;
}
//Set up the API key
var APIKey="a0aca8a89948154a4182dcecc780b513";
// Display the curent weather and future forecast after putting the city in the tex box.
function displayWeather(event){
    event.preventDefault();
    if(sCity.val().trim()!==""){
        city=sCity.val().trim();
        currentWeather(city);
    }
}
// Have to create the AJAX call
function currentWeather(city){

// Then I have to build the URL so we can get a data from server side.
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

// Console log to see subsections 
        console.log(response);

//Dta object from server side Api for icon property.

        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
// The date format method 
        var date=new Date(response.dt*1000).toLocaleDateString();
//parse the response for name of city and add the date and icon.
        $(cCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");
// Display the current temperature.
// Also convert the temp to fahrenheit
     var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(cTemp).html((tempF).toFixed(2)+"&#8457");
// Display the Humidity
        $(cHumidity).html(response.main.humidity+"%");
//Display Wind speed and convert to MPH
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(cWSpeed).html(windsmph+"MPH");
// Display UVIndex.
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            cCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(cCity);
            if (cCity==null){
                cCity=[];
                cCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(cCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    cCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(cCity));
                    addToList(city);
                }
            }
        }

    });
}
// This function returns the UVIindex response.
function UVIndex(ln,lt){
//Have to build the url for uvindex.
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(cUVIndex).html(response.value);
            });
}
    
// Here we display the 5 days forecast for the current city.
function forecast(cityid){
    var dayover= false;
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            // Because it is in Kelvin we have to change it to Fahrenheit
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconurl+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        }
        
    });
}

//Add the city on the search history after the previously added city 
function addToList(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}
// Display the past search again when the list group item is clicked in search history
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

// Create a render function
function loadlastCity(){
    $("ul").empty();
    var cCity = JSON.parse(localStorage.getItem("cityname"));
    if(cCity!==null){
        cCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<cCity.length;i++){
            addToList(cCity[i]);
        }
        city=cCity[i-1];
        currentWeather(city);
    }

}
// Need to to be able to clear the history
function clearHistory(event){
    event.preventDefault();
    cCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//Need to add click Handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);


