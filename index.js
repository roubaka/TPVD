
// Initiaize the map
var map = new L.map("map", {center: [46.52, 6.60], zoom: 14});
var cartodb = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
});

// Add the cartodb layer to the map
cartodb.addTo(map);

// Creating the public transportation layer
let ptStops = [];

let ptsOverlay = L.d3SvgOverlay(function(sel,proj){
	var ptsUpd = sel.selectAll('circle').data(ptStops);
	ptsUpd.enter()
				.append("circle")
				.attr('cx', function(d){return proj.latLngToLayerPoint(d.latLng).x;})
				.attr('cy', function(d){return proj.latLngToLayerPoint(d.latLng).y;})
				.attr('r', function(d){
					if(d.MOYEN_TRAN == 'Bus'){
						return 15;
					} else {
						return 75;
					}
				})
				.attr('fill', 'none')
				.attr('stroke', 'black')
				.attr('opacity', 0.5)
				.attr('class', function(d){
					return d.MOYEN_TRAN;
				});
	});
// Loading the public transportation datas
d3.csv("data/pts_buff.csv",function(data){
ptStops = data.map(function(d){
  d.latLng = [+d.Y,+d.X];
  // d.ALTITUDE = (d.ALTITUDE == '') ? 50 : +d.ALTITUDE; //NAs
  return d;
});
ptsOverlay.addTo(map);
});

// Creating the heatmap based on the poputlation hectares
let heathect = [];
// Loading population datas
d3.csv("data/hectpop_xy4.csv", function(data) {
 	for(i = 0; i < data.length ; i++){
		heathect.push([]);
		heathect[i][0] = data[i].Y;
		heathect[i][1] = data[i].X;
		heathect[i][2] = data[i].B14BTOT;
	}

// Adding the heatmap layer to the map
	let heatmap = L.heatLayer(heathect, {radius: 25, max:65}).addTo(map);
 })
