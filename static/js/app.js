var myApp = angular.module('myApp', ['ngRoute','ngCookies','ngMaterial', 'md.data.table'])


.config(['$mdThemingProvider','$routeProvider', 
  function ($mdThemingProvider,$routeProvider) {

    'use strict';
    $routeProvider.
      
       when('/', {
           templateUrl: '/static/partials/main.html',
           controller: 'mainController'  
       }).                         
       otherwise({
           redirectTo: '/'
       });                                

    $mdThemingProvider.theme('default')
      .primaryPalette('blue');
}])
.controller('mainController', ['$mdEditDialog', '$q', '$scope','$http', '$timeout', function ($mdEditDialog, $q, $scope,$http, $timeout) {
  'use strict';
  
  $scope.selected = [];
  $scope.limitOptions = [5, 10, 15];
  
  $scope.options = {
    rowSelection: true,
    multiSelect: true,
    autoSelect: true,
    decapitate: false,
    largeEditDialog: false,
    boundaryLinks: false,
    limitSelect: true,
    pageSelect: true
  };
  
  $scope.query = {
    order: 'date',
    limit: 5,
    page: 1
  };
  
  
 
  $scope.toggleLimitOptions = function () {
    $scope.limitOptions = $scope.limitOptions ? undefined : [5, 10, 15];
  };

  
  $scope.loadStuff = function () {
    
    if($scope.cityquery){

      if($scope.previousQuery != $scope.cityquery){
        GetWeatherForecast($scope.cityquery);
        $scope.promise = $timeout(function () {
          // loading
        }, 2000);
      }
      else{
        Materialize.toast('Update search query', 3000);
        console.log("old query");
      }
    }
    
  };

  function buildData(){
    var list = $scope.weatherForecastor.data;
    var data = $scope.city+"\n\n";

    for (var i = 0; i < list.length; i++) {
      var weathr = list[i];
      data += weathr.day +"\n"+
              "Temperature : "+ weathr.weather.temp+"\n"+
              "Sky Conditions : "+ weathr.weather.clddes+"\n"+
              "Humidity : "+ weathr.weather.humd+"\n\n";           

    }
          console.log(data);
    return data;
  }

  $scope.saveData = function(){

    var filename = prompt("Please enter file name with extension", "data.txt");
    if(filename == null)
      return;


    if (filename.length > 4) {
        // Convert data (forecaster) to text.
        var blob = new Blob([buildData()], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename);  
    }else{
        Materialize.toast("Invalid Filename", 2000);

    }

  };
  
  $scope.logItem = function (item) {
    console.log(item.name, 'was selected');
  };
  
  $scope.logOrder = function (order) {
    console.log('order: ', order);
  };
  
  $scope.logPagination = function (page, limit) {
    console.log('page: ', page);
    console.log('limit: ', limit);
  };

  $scope.city = "unknown";
  $scope.country = "unknown";
  

  // Api to get weather. 
  $scope.previousQuery = null
  $scope.weatherForecastor  = null;
  
  if ($scope.weatherForecastor == null ){
    
    GetWeatherForecast("Galway");
  } 

  function GetWeatherForecast(query){
    $scope.previousQuery  = query;
    $http({
        method:'GET',
        url:'http://api.openweathermap.org/data/2.5/forecast?q='+query+'&appid=f08af293952634512b15b3ab0d69e878',
        headers: {
           'Content-Type': 'application/json;charset=utf-8'
        }
    })
    .then(function(resp){
        // console.log(resp);

        if(resp['status'] == 200 && resp['data'] && resp['data']  ){
          var data = resp['data'];
          if(data['cod'] == 200){
            // Good to go.

            $scope.weatherForecastor = parseWeatherData(data);
            $scope.city = $scope.weatherForecastor.loc['city'];
            $scope.country = $scope.weatherForecastor.loc['country'];   
                     
            console.log($scope.weatherForecastor);
          }else{
            // Error here
            console.log("Error here.");
            console.log(data['message']);
            Materialize.toast(data['message'], 3000);

          }

        }
        else{


          // Error here
          console.log('Error');
          Materialize.toast('Error', 3000);

        }
      
    },function(error){
        console.log(error);
        Materialize.toast(error, 3000);
    });
  }

  

}]);
// .controller('nutritionController');

myApp.factory("CookieService", function($timeout,$cookies) {

    function CookieService() {
        var self = this;
        self.cookievalue = null;
        
        self.setCookie = function(value){
            $cookies.put("sessionkey",value);
            self.cookievalue =  value;
        }   

        self.getCookie = function(){
            self.cookievalue =  $cookies.get('sessionkey', null);
            console.log("Logging cookievalue "+ self.cookievalue);
            return self.cookievalue;
        }   
        self.removeCookie = function(){
             $cookies.remove("sessionkey");  
             self.cookievalue = null; 
        }
    }

    return new CookieService();

});



function parseWeatherData(data){
    console.log(data);

    var model = [];
    var count = 0;
    var location = null;
    var city = "unknown" , country = "unknown";
    if(data.city){
      if(data.city["name"] )
        city = data.city['name'];
      if(data.city["country"] )
        country = data.city['country'];
       
    }

   location = {city: city , country: country};

    if (data['cnt'])
      count = data['cnt'] / 5;

    var list = []
    if(data['list'])
      list = data['list']
    for (var i = 0 ; i < list.length ; i += count ) {
      // Skipping count amount of forecaast, as api gives 
      // count forecast of a single day.
      var wthr = getDescriptor(list[i]);
        // console.log(list[i]);

      model.push({day: getDay(list[i].dt_txt), dt: list[i].dt, date: list[i].dt_txt, weather : wthr});
    }

    // console.log(model);
    
    return {"loc":location, "count": model.length,"data": model};
}
function getDescriptor(data){
  var temp = "No info", 
  humidity = "No info";
  var clouds = "No info"; 
  var cloudsDes = "No info";
  if(data['main'] ){
    if(data['main'].temp ) {
      temp = data['main'].temp;
    } 
    if(data['main'].humidity){
      humidity = data['main'].humidity;
    }
  }
 
  if(data.weather && data.weather[0].main && data.weather[0].description ){
    clouds = data.weather[0].main
    cloudsDes = data.weather[0].description;
  }

  return {cld: clouds, clddes : cloudsDes , temp : temp , humd: humidity};
}
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDay(dateString){
  return days[new Date(dateString).getDay()];
}

