/// <reference path="../Scripts/angular.js" />
/// <reference path="../Scripts/jquery-3.1.0.js" />

var jorneyApp = angular.module("jorneyApp", []);
jorneyApp.controller("JorneyController", ["$scope", "$http", JorneyCtrl]);

function JorneyCtrl ($scope, $http) {
    $scope.routes = null;
    $scope.initRoutes = function () {
        $http.get("https://api.tfl.gov.uk/Line/Mode/bus?app_id=&app_key=")
        .success(function (data) {
            $scope.routes = data.slice(1, 101);
        })
        .error(function (data) {
            console.log(data);
        });
    }
    $scope.currentRouteCoord = null;
    $scope.paintRoute = function (routeId) {
        getRouteInfo(routeId);        
    }

    function getRouteInfo(routeId) {
        $http.get("https://api.tfl.gov.uk/Line/" + routeId + "/Route/Sequence/ inbound?serviceTypes=regular&excludeCrowding=True&app_id=&app_key=")
        .success(function (data) {
            $scope.currentRouteCoord = JSON.parse(data.lineStrings[0]);
            $scope.fsd = $scope.currentRouteCoord;
        })
        .error(function (data) {
            console.log(data);
        });
    }
}