/// <reference path="../Scripts/angular.js" />
/// <reference path="../Scripts/jquery-3.1.0.js" />

var jorneyApp = angular.module("jorneyApp", [])
    .constant('ACCESS_PARAMS', {
        APP_ID: '4f340f09',
        APP_KEY: 'f6c1a49618dca9f4bb12c9455c03d8aa'
    })

    .controller("JorneyController", ["$scope", "$http", "$timeout", "ACCESS_PARAMS", JorneyCtrl]);
function JorneyCtrl($scope, $http, $timeout, ACCESS_PARAMS) {
    var RoutesNames = [];
    $scope.suggestions = [];
    var Routes = null;
    $scope.selectedIndex = -1;
    $scope.searchText = "";
    var Markers = []; //need for cleaning map
    $scope.initRoutes = function () {
        $http.get("https://api.tfl.gov.uk/Line/Mode/bus?app_id=" + ACCESS_PARAMS.APP_ID + "&app_key=" + ACCESS_PARAMS.APP_KEY)
        .success(function (data) {
            Routes = data;
            for (i in Routes) {
                RoutesNames.push(Routes[i].name);
            };
            RoutesNames.sort();
            //$scope.suggestions = RoutesNames;
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

    $scope.search = function (searchText) {
        $scope.suggestions = [];
        temp = [];
        function searchInnerFunc() {
            for (var i = 0; i < RoutesNames.length; i++) {
                var itemInLowerCase = angular.lowercase(RoutesNames[i]);
                var searchTextInLowerCase = angular.lowercase(searchText);
                if (itemInLowerCase.indexOf(searchTextInLowerCase) !== -1) {
                    temp.push(RoutesNames[i]);
                }
            }
            return temp;
        }
        $scope.suggestions = searchInnerFunc();
    }

    $scope.$watch('selectedIndex', function (value) {
        if (value !== -1) {
            $scope.searchText = $scope.suggestions[$scope.selectedIndex];
        }
    });

    $scope.checkKeyDown = function (event) {
        if (event.keyCode === 40) { //down key
            event.preventDefault();
            if ($scope.selectedIndex + 1 !== $scope.suggestions.length) {
                $scope.selectedIndex++;
            }
        }
        else if (event.keyCode === 38) { //up key
            event.preventDefault();
            if ($scope.selectedIndex - 1 !== -1) {
                $scope.selectedIndex--;
            }
        }
        else if (event.keyCode === 13) { //enter
            event.preventDefault();
            $scope.suggestions = [];// need to test
        }
    }
    $scope.checkKeyUp = function (event) {
        if (event.keyCode !== 8 || event.keyCode !== 46) { //backspace or delete
            if ($scope.searchText == "") {
                $scope.suggestions = [];
            }
        }
    }
    $scope.assignValueAndHide = function (index) {
        $scope.searchText = $scope.suggestions[index];
        $scope.suggestions = [];
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
                map: $scope.map
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
    function startLoadingAnimation() {
        $scope.onLoading = true;
        var imgObj = $("#loadingImg");
        imgObj.show();
    }
    function stopLoadingAnimation() {
        $scope.onLoading = false;
        $("#loadingImg").hide();
    }
}


