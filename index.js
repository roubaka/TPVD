
// est ce que git va marcher
var map = new L.map("map", {center: [46.52, 6.60], zoom: 14});
var cartodb = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
});
cartodb.addTo(map);

// couche des hectares qui marchent avec svgoverlay, mais sont initialisés en polygon > pas trop de latence
// !!! ne marche qu'en d3v3

var hect = [];
var hectOverlay = L.d3SvgOverlay(function(sel, proj) {

	var upd = sel.selectAll('path').data(pts);
	upd.enter()
		.append('circle')
		.attr('d', proj.pathFromGeojson)
		.attr('fill', 'green')
});

// pour le selecteur de couches
	L.control.layers({"Carte light": cartodb}, {"Population par hectares ": hectOverlay}).addTo(map);

d3.json("data/hectpop_xy4.geojson", function(data) {
	 pts = data.features;
	 hectOverlay.addTo(map)
});

 // // couche des pts qui marchent avec svgoverlay, mais sont initialisés en polygon > pas trop de latence
 // !!! ne marche qu'en d3v3

 // var pts = [];
 // var ptsOverlay = L.d3SvgOverlay(function(sel, proj) {
 //
 // 	var upd = sel.selectAll('path').data(pts);
 // 	upd.enter()
 // 		.append('path')
 // 		.attr('d', proj.pathFromGeojson)
 // 		.attr('fill', 'red')
 // 	.attr()
 //  });
 //
 // d3.json("data/pts_wgs3.geojson", function(data) {
 // 	 pts = data.features;
 // 	 ptsOverlay.addTo(map)
 // ;})

	let ptStops = [];

		let ptsOverlay = L.d3SvgOverlay(function(sel,proj){
			var ptsUpd = sel.selectAll('circle').data(ptStops);
			ptsUpd.enter()
						.append("circle")
						.attr('cx', function(d){return proj.latLngToLayerPoint(d.latLng).x;})
    				.attr('cy', function(d){return proj.latLngToLayerPoint(d.latLng).y;})
						.attr('r', function(d){
							return d.ALTITUDE/100;
						})
						.attr('fill', 'red');
		});

		d3.csv("data/pts_buff.csv",function(data){
	  ptStops = data.map(function(d){
	    d.latLng = [+d.Y,+d.X];
	    d.ALTITUDE = (d.ALTITUDE == '') ? 50 : +d.ALTITUDE; //NAs
	    return d;
	  });
	  ptsOverlay.addTo(map);
		});

	/// EXample
	var citiesOverlay = L.d3SvgOverlay(function(sel,proj){

  var minLogPop = Math.log2(d3.min(cities,function(d){return d.population;}));
  var citiesUpd = sel.selectAll('circle').data(cities);
  citiesUpd.enter()
    .append('circle')
    .attr('r',function(d){return Math.log2(d.population) - minLogPop + 2;})
    .attr('cx',function(d){return proj.latLngToLayerPoint(d.latLng).x;})
    .attr('cy',function(d){return proj.latLngToLayerPoint(d.latLng).y;})
    .attr('stroke','black')
    .attr('stroke-width',1)
    .attr('fill',function(d){return (d.place == 'city') ? "red" : "blue";});
});
///

let heathect = []; // on doit créer un talbeau d'objets ave lat long b14btot depuis le geojson

d3.json("data/hectpop_xy4.geojson", function(data) {
 	for(i = 0; i < data.features.length ; i++){
		heathect.push([]);
		heathect[i][0] = data.features[i].geometry.coordinates[1];
		heathect[i][1] = data.features[i].geometry.coordinates[0];
		heathect[i][2] = data.features[i].properties.B14BTOT;
	}

	let heatmap = L.heatLayer(heathect, {radius: 30, max:65}).addTo(map);
 })


//  var heatmap = L.heatLayer([
//  	[46.52, 6.60, 100], // lat, lng, intensity
//  	[46.51, 6.62, 30],
// ], {radius: 10}).addTo(map);

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
