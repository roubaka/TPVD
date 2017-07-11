O = {};

// Methods to get the size of the browser viewport
let windowHeight = $(window).height();  // returns height of browser viewport
let windowWidth = $(window).width();  // returns width of browser viewport

let dataGraph = [0,0,0,0];
let line;

// Dictionnary of buffer size and values linked to slider
let bufferVal = [
	{"sliderVal": 1, "buffer" : "100m", "bufferPx" : 15, "pop" : "buff100_SU"},
	{"sliderVal": 2, "buffer" : "250m", "bufferPx" : 37.5, "pop" : "buff250_SU"},
	{"sliderVal": 3, "buffer" : "500m", "bufferPx" : 75, "pop" : "buff500_SU"},
	{"sliderVal": 4, "buffer" : "1000m", "bufferPx" : 150, "pop" : "buff1000_S"}
];

// GLOBAL VARIABLES
let map;
let tooltipMap;

// Initiaize the whole script of the page
O.main = function(){
	O.initMap();
	O.sliderevent();
	O.initGraph();
};

O.initMap = function(){
	// Initiaize the map
	map = new L.map("map", {center: [46.52, 6.60], zoom: 14, minZoom: 10, maxZoom: 15, maxBounds: ([[46.128688, 5.971754],[47.121474, 7.313116]])});
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
		let heatmap = L.heatLayer(heathect, {radius: 30, max: 500}).addTo(map);
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
		.style('position', 'relative')
		.style('stroke','black')
		// .style('z-index', 10000000)
		.attr('opacity', 0.5)
		.attr('class', function(d){
			if(d.MOYEN_TRAN.match('CheminFer')){
				return "bigBuff dot"
			} else if(d.MOYEN_TRAN == 'Bus'){
				return "smallBuff dot"
			} else {
				return "midBuff dot"
			}
		});
	});

	// ptsOverlay.setZIndex(15);
	// ptsOverlay.bringToFront()

	// Loading the public transportation datas
	d3.csv("data/pts_buff.csv",function(data){
		console.log(data);
		ptStops = data.map(function(d){
			d.latLng = [+d.Y,+d.X];
			return d;
		});
		ptsOverlay.addTo(map);
	});

	setTimeout(function(){
		d3.selectAll('.dot')
			.on('mouseover',function(d){
				d3.select(this)
					// .style('z-index', 10)
					.transition()
					.duration(50)
					.attr('r', function(d){
						if(d.MOYEN_TRAN.match('CheminFer')){
							return bufferVal[$('#slider1').val()-1].bufferPx;
						} else if(d.MOYEN_TRAN == 'Bus'){
							return bufferVal[$('#slider3').val()-1].bufferPx;
						} else {
							return bufferVal[$('#slider2').val()-1].bufferPx;
						}
					});
					console.log(this.style);
					console.log(this.style.zIndex);
				tooltipMap.html(function(){
										let pop = d[bufferVal[$('#slider1').val()-1].pop];
										if(pop == ""){
											pop = "0"
										}
										return `${d.NOM} </br>
										Population desservie : ${pop}`;
									})
									.transition()
									.duration(50)
									.style('opacity', 0.8)
									.style('left', `${d3.event.pageX}px`)
									.style('top', `${d3.event.pageY}px`);

				$('#graphLegend').html(function(){
					return `<tr id="arret"> <td> ${d.NOM} </td> </tr>
									<tr>
										<td> Commune : ${d.NOM_COMMUN} </td>
										<td> Altitude : ${d.ALTITUDE} </td>
									</tr>`;
				})
			})
			.on('click', function(d){
				O.updateGraph(d);
			})
			.on('mouseout', function(){
				d3.select(this)
					// .style('z-index', 10000000)
					.transition()
					.duration(200)
					.attr('r', 6);
					console.log(this.style.zIndex);
				tooltipMap.transition()
									.duration(200)
									.style('opacity', 0);

			});
		}, 1000);
		console.log("2");
};

O.changeOpacity = function(){
	d3.selectAll('.leaflet-heatmap-layer').style('opacity',0.4);
};

O.sliderevent = function(){
	$('.slidBuffer').change(function(){
		$('#slider1_val').html(bufferVal[$('#slider1').val()-1].buffer);
		$('#slider2_val').html(bufferVal[$('#slider2').val()-1].buffer);
		$('#slider3_val').html(bufferVal[$('#slider3').val()-1].buffer);
	});
}

O.initGraph = function(){
		// Creating margins for the svg
	  margin = {top : 5, right : 10, bottom : 20, left : 55};

	  // Setting dimensions of the svg and padding between each value of the barplot
	  wGraph = $('#graphPart').width() - margin.left - margin.right;
	  hGraph = 350 - margin.top - margin.bottom;

	  // Creating svg, appending attributes
	  svgGraph = d3.select("#graph")
	               .append("svg")
	               .attr("width", wGraph + margin.left + margin.right)
	               .attr("height", hGraph + margin.top + margin.bottom)
	               .append("g")
	               .attr("transform", `translate(${margin.left},${margin.top})`);

		tooltipGraph = d3.select('#graph')
	                   .append('div')
	                   .attr('class', 'hidden tooltip');

		svgGraph.selectAll('.point')
						.data(dataGraph)
						.enter()
						.append('circle')
						.attr('class','point')
						.attr('cx', function(d){
							// return xScale(d.size);
							return 0;
						})
						.attr('cy', hGraph)
						.attr('r',0)
						.style('fill', 'white');

		svgGraph.append('g')
						.attr('class','xAxis')
						.attr('transform', `translate(0,${hGraph})`);

		svgGraph.append('g')
						.attr('class', 'yAxis');

		svgGraph.append('path')
						.attr('class','line')
						// .attr('d','M0,0L0,0')
						.style('stroke','none');
	}

	O.updateGraph = function(data) {
		// Transforming data
		dataGraph = [];
		dataGraph.push({"size": 100, "pop": +data.buff100_SU});
		dataGraph.push({"size": 250, "pop": +data.buff250_SU});
		dataGraph.push({"size": 500, "pop": +data.buff500_SU});
		dataGraph.push({"size": 1000, "pop": +data.buff1000_S});

		// Setting up X
		xScale = d3.scale.linear().range([0,wGraph]).domain([0,1000]);
		// xScale = d3.scale.linear().range([0,wGraph]);

		xAxis = d3.svg.axis().scale(xScale).orient('bottom');

		// Setting up Y
		let yMin = d3.min(dataGraph, function(d){return d.pop});
		let yMax = d3.max(dataGraph, function(d){return d.pop})
		yScale = d3.scale.linear().range([hGraph,0]).domain([yMin,yMax]);
		yAxis = d3.svg.axis().scale(yScale).orient('left');

		let line = d3.svg.line()
								 .x(function(d){
									 return xScale(d.size);
								 })
								 .y(function(d){
									 return yScale(d.pop);
								 });

		svgGraph.select('.xAxis')
						.transition()
						.duration(1000)
						.call(xAxis)
						.attr('x', wGraph)
						.attr('y', -3);;


		svgGraph.select('.yAxis')
						.transition()
						.duration(1000)
						.call(yAxis)
						.attr('y',6)
						.attr('dy', '.71em');

		svgGraph.select('.line')
						.transition()
						.duration(1000)
						.attr('d',line(dataGraph))
						.style('stroke','black')
						.style('stroke-width',2)
						.style('fill','none');

		svgGraph.selectAll('.point')
						.data(dataGraph)
						.transition()
						.duration(1000)
						.attr('cx', function(d){
							return xScale(d.size)
						})
						.attr('cy', function(d){
							return yScale(d.pop)
						})
						.attr('r',10)
						.style('fill','red');


	}
