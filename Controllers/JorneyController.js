/// <reference path="../Scripts/angular.js" />
/// <reference path="../Scripts/jquery-3.1.0.js" />

var jorneyApp = angular.module("jorneyApp", [])
    .constant('ACCESS_PARAMS', {
        APP_ID: '4f340f09',
        APP_KEY: 'f6c1a49618dca9f4bb12c9455c03d8aa'
    })

    .controller("JorneyController", ["$scope", "$http", "ACCESS_PARAMS", JorneyCtrl]);
function JorneyCtrl($scope, $http, ACCESS_PARAMS) {
    $scope.routes = null;
    var Markers = []; //need for cleaning map
    $scope.initRoutes = function () {
        $http.get("https://api.tfl.gov.uk/Line/Mode/bus?app_id=" + ACCESS_PARAMS.APP_ID + "&app_key=" + ACCESS_PARAMS.APP_KEY)
        .success(function (data) {
            $scope.routes = data.slice(1, 101);
        })
        .error(function (data) {
            console.log(data);
        });
    }
    $scope.initMap = function () {
        startLoadingAnimation();
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            //set London's coords 
            center: { lat: 51.528837, lng: -0.165653 },
            zoom: 10
        });
        google.maps.event.addDomListener(window, 'load', $scope.initialize);
        google.maps.event.addListenerOnce($scope.map, 'idle', function () {
            stopLoadingAnimation();
        });        
    }

    $scope.paintRoute = function (routeId) {
        if ($scope.onLoading) {  //map or stations info have onLoading state
            return false;
        }
        getRouteInfo(routeId, function (stationsInfo) {
            setMarkers(stationsInfo);
        });         
    }
   
    function getRouteInfo(routeId, setMarkers) {
        startLoadingAnimation();
        $http.get("https://api.tfl.gov.uk/Line/" + routeId + "/Route/Sequence/ inbound?serviceTypes=regular&excludeCrowding=True&app_id=" + ACCESS_PARAMS.APP_ID + "&app_key=" + ACCESS_PARAMS.APP_KEY)
        .success(function (data) {            
            $scope.currentRouteStationsInfo = data.stations;
            stopLoadingAnimation();
            setMarkers($scope.currentRouteStationsInfo);
        })
        .error(function (data) {           
            console.log(data);
            stopLoadingAnimation();
            $scope.currentRouteStationsInfo = null;
        });  
    }

    function setMarkers(routeStationsInfo) {
        CleanMap();
        var arrLength = routeStationsInfo.length;     
        for (var i = 0; i < arrLength; i++) {             
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(routeStationsInfo[i].lat, routeStationsInfo[i].lon),
                title: routeStationsInfo[i].name,
                map:$scope.map
            });     
            Markers.push(marker);
        }             
        var numOfMiddleStation = Math.floor(arrLength / 2);
        $scope.map.setCenter(new google.maps.LatLng(routeStationsInfo[numOfMiddleStation].lat, routeStationsInfo[numOfMiddleStation].lon));   
    }

    function CleanMap() {
        if (Markers.length != 0) {
            for (i in Markers) {
                Markers[i].setMap(null);
            }
            Markers = [];
        }       
    }

    $scope.onLoading = true; //this flag needs for make spans unclickable
    function startLoadingAnimation()
    {
        $scope.onLoading = true;
        var imgObj = $("#loadingImg");
        imgObj.show();      
    } 
    function stopLoadingAnimation() 
    {
        $scope.onLoading = false;
        $("#loadingImg").hide();
    }
}
