/// <reference path="../Scripts/angular.js" />
/// <reference path="../Scripts/jquery-3.1.0.js" />

var jorneyApp = angular.module("jorneyApp", []);
jorneyApp.controller("JorneyController", ["$scope", "$http", JorneyCtrl]);

function JorneyCtrl ($scope, $http) {
    $scope.busIds = null;
    $scope.getBusIds = function () {
        $http.get("https://api.tfl.gov.uk/Line/Mode/bus?app_id=&app_key=")
        .success(function (data) {
            $scope.busIds = data;
        })
        .error(function (data) {
            console.log(data);
        });
    }
    
}