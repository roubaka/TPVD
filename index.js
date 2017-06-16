
// est ce que git va marcher
var map = new L.map("map", {center: [46.52, 6.60], zoom: 14});
var cartodb = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
});
cartodb.addTo(map);

// // couche des hectares qui marchent avec svgoverlay, mais sont initialisés en polygon > pas trop de latence
// !!! ne marche qu'en d3v3

var hect = [];
var hectOverlay = L.d3SvgOverlay(function(sel, proj) {

	var upd = sel.selectAll('path').data(pts);
	console.log(hect);
	upd.enter()
		.append('path')
		.attr('d', proj.pathFromGeojson)
		.attr('fill', 'green' )
});

L.control.layers({"Geo Tiles": cartodb}, {"hect": hectOverlay}).addTo(map);

d3.json("data/hectpop_xy3.geojson", function(data) {
	 pts = data.features; hectOverlay.addTo(map) })
// //////////////////////////////////
//// ici je teste l'affichage d'une couche de polygon avec svgoverlay > marche
//
// var countries = [];
// var countriesOverlay = L.d3SvgOverlay(function(sel, proj) {
//
//   var upd = sel.selectAll('path').data(countries);
//   upd.enter()
//     .append('path')
//     .attr('d', proj.pathFromGeojson)
//     .attr('stroke', 'black')
//     .attr('fill', function(){ return d3.hsl(Math.random() * 360, 0.9, 0.5) })
//     .attr('fill-opacity', '0.5');
//   upd.attr('stroke-width', 1 / proj.scale);
// });
//
// L.control.layers({"Geo Tiles": cartodb}, {"Countries": countriesOverlay}).addTo(map);
//
// d3.json("data/countries.geo.json", function(data) {
//    countries = data.features; countriesOverlay.addTo(map) });

// //////////////////////////////////
// // ici la couche des arrêts de transport en type points avec svgoverlay > ne marche pas, je capte pas pour quoi la function pts = data.features ne joue pas
// var pts = [];
// var ptsOverlay = L.d3SvgOverlay(function(sel, proj) {
//
//   var upd = sel.selectAll('circle').data(pts);
//
//   upd.enter()
//     .append('circle')
// 		.attr('r', 50)
// 		.attr('cx',function(d){return proj.latLngToLayerPoint(d.latLng).x;})
// 		.attr('cy',function(d){return proj.latLngToLayerPoint(d.latLng).y;})
//     .attr('fill', 'red' )
//     .attr('fill-opacity', '0.5');
// });
//
// d3.json("data/pts_wgs3.geojson", function(data){
// 	console.log(data);
// 	pts = data.features(function(d){ // rahhhh je comprends pas pourquoi il me laisse pas faire data.features, à la base data.map ???
//     d.latLng = [+d.geometry.coordinates[0],+d.geometry.coordinates[1]];
//     return d;
//   });
//   ptsOverlay.addTo(map);
// 	});
//

 ///////////////////////////
//// alors ici j'essaie d'afficher les pts sans la librairy svgoverlay > pas d'erreur mais les points ne s'affiche pas
// map._initPathRoot();
//
//  /* We simply pick up the SVG from the map object */
//  var svg = d3.select("#map").select("svg"),
//  g = svg.append("g");
//
//  d3.json("data/pts_wgs3.geojson", function(collection) {
// 	 /* Add a LatLng object to each item in the dataset */
// 	 collection.features.forEach(function(d) {
// 		 d.LatLng = new L.LatLng(d.geometry.coordinates[0],
// 								 d.geometry.coordinates[1])
// 	 })
//
// 	 var feature = g.selectAll("circle")
// 		 .data(collection.features)
// 		 .enter().append("circle")
// 		 .style("stroke", "black")
// 		 .style("opacity", .6)
// 		 .style("fill", "red")
// 		 .attr("r", 20);
// 		  console.log(collection.features);
//
// 	 map.on("viewreset", update);
// 	 update();
//
// 	 function update() {
// 		 feature.attr("transform",
// 		 function(d) {
// 			 return "translate("+
// 				 map.latLngToLayerPoint(d.LatLng).x +","+
// 				 map.latLngToLayerPoint(d.LatLng).y +")";
// 			 }
// 		 )
// 	 }
//  })

 // //////////////////////////////////
