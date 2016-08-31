function initMap() {
    var mapDiv = document.getElementById('map');
    var map = new google.maps.Map(mapDiv, {
        center: { lat: 51.528837, lng: -0.165653 },
        zoom: 10
    });
}