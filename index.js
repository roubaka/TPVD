var map = new L.Map("map", {center: [46.53, -6.62], zoom: 9})
    .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

d3.json("data/hectpopVD.geojson", function(error, collection) {
  if (error) throw error;

  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  var transform = d3.geoTransform({point: projectPoint}),
    path = d3.geo.projection(transform);

  var feature = g.selectAll("path")
    .data(collection.features)
    .enter().append("path");


});
