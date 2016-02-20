var map = L.map('map').setView([51.505, -0.09], 3);
var lt=40.7141667,lg=-74.0063889,flag=0,formattedTime="",place="",weather="",time="",color=null,backgroundimage=null,icon="";
var data4={"address":{"country":"","city":"","longitude":"","latitude":""},"parameters":{"temperature":0,"humidity":0,"pressure":0,"maxtemp":0,"mintemp":0, "visibility":0},"weather":{"main":"","Description":""}};

var themes={"01d":"#3672AA","01n":"#2b2845","02d":"#87CEFA","02n":"#2b2845","03d":"#D8EDF2","03n":"#132030","04d":"#A2A2D0","04n":"3b3f48","09d":"#4c6370"};
var fixed=0,gmt=0,zone="",hourChoice="H",c=0,forecastHtml="",tempUnitChoice=1,temper="",mainTemperature=0,forecastTemperatures=[],forecastIcons=[],forecastDates=[],tval=0;



var x = document.getElementById("located");
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}
function showPosition(position) {
  fakeClick(position.coords.latitude, position.coords.longitude);
}



L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
  maxZoom: 18,
  minZoom: 2,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'mapbox.streets'
}).addTo(map);





var popup = L.popup();

function onMapClick(e) {
  flag=0;
  var temp=e.latlng;
  lt=temp.lat;
  lg=temp.lng;
  getData(lt,lg);
  setInterval(function(){getData(lt,lg);},1000*60*10);
  //$(".data").html("latitude: "+lt+" Longitude: "+lg);
//  popup
//    .setLatLng(e.latlng)
//    .setContent()
//    .openOn(map);

    L.marker([lt, lg]).addTo(map).on("click",onClick);
}

function fakeClick(lat,long){
  flag=0;
  getData(lat,long);
  L.marker([lat, long]).addTo(map).on("click",onClick);
  map=map.setView([lat, long], 5);
}

function onClick(){
  flag=0;
  var ltlg=this.getLatLng();
  lt=ltlg.lat;
  lg=ltlg.lng;
  getData(lt,lg);
}

function getData(lat, long){
  moment.tz.setDefault("GMT");
  place="";
  weather="";
  forecastHtml="";
  temper="";
  var link="http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+long+"&appid=1c60cbbee63e0b5fa88237f945858152";
  $.getJSON(link,function(json){
    if(json.cod==="404"&&flag===0){
      flag=1;
      if(long>0){
        var temp=Math.floor(long/360);
        long-=temp*360;
      }
      else if(long<0){
        long*=-1;
        var temp=Math.floor(long/360);
        long-=temp*360;
        long-=360;
        long*=-1;
      }
      getData(lat, long);
    }
    data4.address.place="";
    if(json.name) data4.address.place=json.name;
    data4.address.country="";
    if(json.sys.country!=="none") data4.address.country=getCountryName(json.sys.country);
    place+="<h1 id='name'>"+json.name+"</h1><h1 id='country'>"+getCountryName(data4.address.country)+"</h1>";
    tval=json.main.temp;
    temper+="<h1><span id='temperature'>"+convertTo(tval,tempUnitChoice)+"</span></h1>";
    weather+="<h1>"+convertStatus(json.weather[0].main)+" <span id='tempunits'><a class='cunit'>&#x2103;</a> |<a class='funit'>&#x2109;</a></span></h1><img class='icon' src='"+"images/"+json.weather[0].icon+".png'>";
    weather+="<h1 class='humidity'><img src='humidityicon.png'> "+json.main.humidity+"%</h1>";
    weather+="<h1 class='wind'><img src='windicon.png'> "+degToCard(json.wind.deg)+" at "+Math.floor(Number(json.wind.speed)*2.23694)+" MPH</h1>";
    weather+="<h1 class='pressure'><img src='pressure.png'> "+(json.main.pressure/1000).toPrecision(3)+" bar</h1>";
    setTime(lat,long);
    icon=json.weather[0].icon;
  });
}

function setTime(lat,long){
  var linktime="http://api.timezonedb.com/?lat="+lat+"&lng="+long+"&format=json&key=0F23GMEFRVHI";
  time="";
  $.getJSON(linktime,function(jsonOut){
    zone=jsonOut.zoneName;
    $.getJSON("http://api.timezonedb.com/?lat=51.48&lng=0.00&format=json&key=0F23GMEFRVHI",function(jsonIn){  //execute inside
      gmt=Number(jsonIn.timestamp)*1000;
      c = moment(gmt).tz(zone);
      var zoneDate=c.format("ddd, MMM Do YYYY");
      var zoneTime=c.format(hourChoice+":mm:ss");
      if(icon.indexOf('d')===-1){
        $("body").css("background-image","url('night.jpg')");
      }
      else{
        $("body").css("background-image","url('day1.jpg')");
      }
      $(".place").html(place);
      $(".time").html("<h1>"+zoneDate+"</h1><h1>"+zoneTime+"</h1>");
      $(".temper").html(temper);
      $(".weather").html(weather);
      place="";
      time="";
      temper="";
      weather="";
      if(tempUnitChoice===1){
        $(".cunit").css("pointer-events","none");
        $(".cunit").css("cursor","none");
        $(".funit").css("pointer-events","auto");
        $(".funit").css("cursor","pointer");
        $(".cunit").css("font-size","110%");
        $(".funit").css("font-size","100%");
        $(".cunit").css("color","white");
        $(".funit").css("color","#BBBBBB");
      }
      else{
        $(".funit").css("pointer-events","none");
        $(".funit").css("cursor","none");
        $(".cunit").css("pointer-events","auto");
        $(".cunit").css("cursor","pointer");
        $(".funit").css("font-size","110%");
        $(".cunit").css("font-size","100%");
        $(".funit").css("color","white");
        $(".cunit").css("color","#BBBBBB");
      }
      fixed=new Date().getTime();   //local time when clicked the map
      forecast(lat,long);
      update();
      setInterval(update,500);
    });
  });
}

var degToCard = function(deg){
  if(deg<0) deg+=360;
  if (deg>11.25 && deg<33.75){
    return "NNE";
  }else if (deg>33.75 && deg<56.25){
    return "ENE";
  }else if (deg>56.25 && deg<78.75){
    return "E";
  }else if (deg>78.75 && deg<101.25){
    return "ESE";
  }else if (deg>101.25 && deg<123.75){
    return "ESE";
  }else if (deg>123.75 && deg<146.25){
    return "SE";
  }else if (deg>146.25 && deg<168.75){
    return "SSE";
  }else if (deg>168.75 && deg<191.25){
    return "S";
  }else if (deg>191.25 && deg<213.75){
    return "SSW";
  }else if (deg>213.75 && deg<236.25){
    return "SW";
  }else if (deg>236.25 && deg<258.75){
    return "WSW";
  }else if (deg>258.75 && deg<281.25){
    return "W";
  }else if (deg>281.25 && deg<303.75){
    return "WNW";
  }else if (deg>303.75 && deg<326.25){
    return "NW";
  }else if (deg>326.25 && deg<348.75){
    return "NNW";
  }else{
    return "N";
  }
}

function update(){
  var current=new Date().getTime();
  var secondsPassed=current-fixed;
  var currentZonalTime=gmt+secondsPassed;
  c = moment(currentZonalTime).tz(zone);
  var zoneDate=c.format("ddd, MMM Do YYYY"); //dddd, MMMM Do YYYY, h:mm:ss A
  var zoneTime=c.format(hourChoice+":mm:ss");
  $(".time").html("<h1>"+zoneDate+"</h1><h1>"+zoneTime+"</h1>");
}

function convertTo(temp,x,id){
  if(x===1){
    return (Math.round(Number(temp))-273)+"<span style='font-size:80%'>&#x2103;</span>";
  }
  else if(x===2){
    temp=((Math.round(Number(temp))-273)*9)/5+32;
    return Math.round(temp)+"<span style='font-size:80%'>&#x2109;</span>";
  }
}

function convertStatus(status){
  switch(status){
    case "Rain":
      return "Raining";
      break;
    case "Clouds":
      return "Cloudy";
      break;
    case "Haze":
      return "Hazy";
      break;
  }
  return status;
}

function changeTempUnit(){
  var changed="<h1><span id='temperature'>"+convertTo(tval,tempUnitChoice)+"</span></h1>";
  $(".temper").html(changed);
  var fchanged="<hr>",iterator=0;
  forecastTemperatures.forEach(function(val){
    fchanged+="<h2>"+forecastDates[iterator].toUpperCase()+"</h2><h2>"+convertTo(val,tempUnitChoice)+"<img id='forecasticon' src='"+forecastIcons[iterator]+"'></h2><hr>";
  });
  $(".forecast").html(fchanged);
}

function forecast(lat,long){
  forecastTemperatures=[];
  forecastIcons=[];
  forecastDates=[];
  var forecastHtml="<hr>";
  var temp=c.add(1,'d');
  var jsonlink="http://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+long+"&appid=1c60cbbee63e0b5fa88237f945858152";
  $.getJSON(jsonlink,function(json){
    json.list.forEach(function(val){
      if(val.dt*1000>=temp){
        var nextDate=moment((val.dt)*1000).tz(zone).format("ddd MM/DD");
        forecastDates.push(nextDate);
        var icon="images/"+val.weather[0].icon+".png";
        forecastIcons.push(icon);
        var temperatureVal=convertTo(val.main.temp,tempUnitChoice);
        forecastTemperatures.push(val.main.temp);
        forecastHtml+="<h2>"+nextDate.toUpperCase()+"</h2><h2>"+temperatureVal+"<img id='forecasticon' src='"+icon+"'></h2><hr>";
        temp = temp.add(1,'d');
      }
    });
    $(".forecast").html(forecastHtml);
  });
}

$(document).ready(function(){
  map.on('click', onMapClick);
  fakeClick(lt,lg);
  $(".weather").on("click",'.cunit',function(){
    tempUnitChoice=1;
    changeTempUnit();
    $(".cunit").css("pointer-events","none");
    $(".cunit").css("cursor","none");
    $(".funit").css("pointer-events","auto");
    $(".funit").css("cursor","pointer");
    $(".cunit").css("font-size","110%");
    $(".funit").css("font-size","100%");
    $(".cunit").css("color","white");
    $(".funit").css("color","#BBBBBB");
  });
  $(".weather").on("click",'.funit',function(){
    tempUnitChoice=2;
    changeTempUnit();
    $(".funit").css("pointer-events","none");
    $(".funit").css("cursor","none");
    $(".cunit").css("pointer-events","auto");
    $(".cunit").css("cursor","pointer");
    $(".funit").css("font-size","110%");
    $(".cunit").css("font-size","100%");
    $(".funit").css("color","white");
    $(".cunit").css("color","#BBBBBB");
  });

  $("#homeButton").on("click",function(){
    $("#slide1").css("z-index","100");
    $("#slide1").css("visibility","visible");
    $("#slide2").css("z-index","0");
    $("#slide2").css("visibility","hidden");
  });
  $("#mapButton").on("click",function(){
    $("#slide2").css("z-index","100");
    $("#slide2").css("visibility","visible");
    $("#slide1").css("z-index","0");
    $("#slide1").css("visibility","hidden");
  })
});
