O = {};

let bufferVal = [
	{"sliderVal": 1, "buffer" : "100m", "bufferPx" : 15, "pop" : "buff100_SU"},
	{"sliderVal": 2, "buffer" : "250m", "bufferPx" : 37.5, "pop" : "buff250_SU"},
	{"sliderVal": 3, "buffer" : "500m", "bufferPx" : 75, "pop" : "buff500_SU"},
	{"sliderVal": 4, "buffer" : "1000m", "bufferPx" : 150, "pop" : "buff1000_S"}
];


// Methods to get the size of the browser viewport
let windowHeight = $(window).height();  // returns height of browser viewport
let windowWidth = $(window).width();  // returns width of browser viewport

// GLOBAL VARIABLES
let map;

let tooltipMap;
// let heatmap;

O.main = function(){
	O.initMap();
	O.sliderevent();
};

O.initMap = function(){
	// Initiaize the map
	map = new L.map("map", {center: [46.52, 6.60], zoom: 14});
	let cartodb = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
	});

	// Add the cartodb layer to the map
	cartodb.addTo(map);

	O.makeHeatMap();
	setTimeout(function(){
		O.makePtStops();
	}, 250);

	// var opacitySlider = new L.Control.opacitySlider();
	// map.addControl(opacitySlider);
	// opacitySlider.setOpacityLayer(heatmap);

	tooltipMap = d3.select('#map')
								 .append('div')
								 .attr('class', 'tooltip');
};

O.makeHeatMap = function(){
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
				O.changeOpacity();
		// heatmap.setZIndex(0);
	})
	console.log("1");
	// O.makePtStops();
};

O.makePtStops = function(){
	// Creating the public transportation layer
	let ptStops = [];

	let ptsOverlay = L.d3SvgOverlay(function(sel,proj){
		var ptsUpd = sel.selectAll('circle').data(ptStops);
		ptsUpd.enter()
		.append("circle")
		.attr('cx', function(d){return proj.latLngToLayerPoint(d.latLng).x;})
		.attr('cy', function(d){return proj.latLngToLayerPoint(d.latLng).y;})
		.attr('r', 6)
		.attr('fill', function(d){
			if(d.MOYEN_TRAN.match('CheminFer')){
				return "blue"
			} else if(d.MOYEN_TRAN == 'Bus'){
				return "lime"
			} else {
				return "turquoise"
			}
		})
		.style('stroke','black')
		.attr('opacity', 0.5)
		.attr('class', function(d){
			if(d.MOYEN_TRAN.match('CheminFer')){
				return "bigBuff"
			} else if(d.MOYEN_TRAN == 'Bus'){
				return "smallBuff"
			} else {
				return "midBuff"
			}
		});
	});

	// ptsOverlay.setZIndex(15);
	// ptsOverlay.bringToFront()

	// Loading the public transportation datas
	d3.csv("data/pts_buff.csv",function(data){
		ptStops = data.map(function(d){
			d.latLng = [+d.Y,+d.X];
			// d.ALTITUDE = (d.ALTITUDE == '') ? 50 : +d.ALTITUDE; //NAs
			return d;
		});
		ptsOverlay.addTo(map);
	});

	setTimeout(function(){
		d3.selectAll('circle')
			.on('mouseover',function(d){
				d3.select(this)
					.transition()
					.duration(50)
					.attr('r', function(){
						return bufferVal[$('#slider1').val()-1].bufferPx;
					});
				tooltipMap.html(function(){
										let pop = d[bufferVal[$('#slider1').val()-1].pop];
										if(pop == ""){
											pop = "0"
										}
										return `${d.NOM} </br> ${pop}`;
									})
									.transition()
									.duration(50)
									.style('opacity', 0.8)
									.style('left', `${d3.event.pageX}px`)
									.style('top', `${d3.event.pageY}px`);
			})
			.on('mouseout', function(){
				d3.select(this)
					.transition()
					.duration(200)
					.attr('r', 6);
				tooltipMap.transition()
									.duration(200)
									.style('opacity', 0);
			});
		}, 1000);
		console.log("2");
};

O.changeOpacity = function(){
	d3.selectAll('.leaflet-heatmap-layer').style('opacity',0.4);
	console.log("quoiquoiquoi");
};

O.sliderevent = function(){
	$('.slidBuffer').change(function(){
		// console.log(bufferVal[]);
		$('#slider1_val').html(bufferVal[$('#slider1').val()-1].buffer);
	});
}
