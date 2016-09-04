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
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            //set London's coords 
            center: { lat: 51.528837, lng: -0.165653 },
            zoom: 10
        });
        google.maps.event.addDomListener(window, 'load', $scope.initialize);
    }

    $scope.paintRoute = function (routeId) {        
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

    function startLoadingAnimation()
    {
        var imgObj = $("#loadingImg");
        imgObj.show();        
        //var centerY = ($('body').height() + imgObj.height()) / 2;
        //var centerX = ($('body').width() + imgObj.width()) / 2;
        //imgObj.offset({ top:centerY , left: centerX });
    } 
    function stopLoadingAnimation() 
    {
        $("#loadingImg").hide();
    }
}
