O = {};

// Methods to get the size of the browser viewport
let windowHeight = $(window).height();  // returns height of browser viewport
let windowWidth = $(window).width();  // returns width of browser viewport

let dataGraph = [0,0,0,0,0,0,0,0,0,0];
let line;

let gradient = ['red', 'yellow', 'lime', 'cyan', 'blue'];

// Dictionnary of buffer size and values linked to slider
let bufferVal = [];

for(i = 1; i <= 10; i++){
	bufferVal.push({"sliderVal": i, "buffer": `${i*100}m`, "bufferPx": i*15, "pop":`pop${i*100}m`});
}

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
	})

	// Adding Legend
	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {
		// Creating div for legend
		let div = L.DomUtil.create('div', 'info legend');

		// Inserting HTML table for gradient color and labels
		div.innerHTML = 'POPULATION <table> <tbody> <tr> <td> <canvas id="myCanvas" width="20" height="75" style="border:1px solid #d3d3d3;opacity:0.7"> </canvas> </td> <td> &nbsp; Elevée </br> </br> </br> </br> &nbsp; Faible </td> </tr> </tbody> </table>';
		return div;
	};

	legend.addTo(map);

	O.colorLegend();
	// O.makePtStops();
};

O.colorLegend = function(){
	// Adding color gradient to the legend
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	var grd = ctx.createLinearGradient(0,0,0,75);

	grd.addColorStop(0, "red");
	grd.addColorStop(0.25, "yellow");
	grd.addColorStop(0.5, "lime");
	grd.addColorStop(0.75, "cyan");
	grd.addColorStop(1, "blue");

	ctx.fillStyle = grd;
	ctx.fillRect(0, 0, 256, 256);
}

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
	d3.csv("data/buffers.csv",function(data){
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
					.duration(100)
					.attr('r', function(d){
						if(d.MOYEN_TRAN.match('CheminFer')){
							return bufferVal[$('#slider1').val()-1].bufferPx;
						} else if(d.MOYEN_TRAN == 'Bus'){
							return bufferVal[$('#slider3').val()-1].bufferPx;
						} else {
							return bufferVal[$('#slider2').val()-1].bufferPx;
						}
					});
				tooltipMap.html(function(){
										let pop = "";
										if(d.MOYEN_TRAN.match('CheminFer')){
											pop = d[bufferVal[$('#slider1').val()-1].pop];
										} else if(d.MOYEN_TRAN == 'Bus'){
											pop = d[bufferVal[$('#slider3').val()-1].pop];
										} else {
											pop = d[bufferVal[$('#slider2').val()-1].pop];
										}
										if(pop == "NA"){
											pop = 0;
										}
										return `${d.NOM} </br>
										Population desservie : ${pop}`;
									})
									.transition()
									.duration(50)
									.style('opacity', 0.8)
									.style('left', `${d3.event.pageX}px`)
									.style('top', `${d3.event.pageY}px`);

			})
			.on('click', function(d){
				$('#graphLegend').html(function(){
					return `<tr id="arret"> <td> ${d.NOM} </td> </tr>
									<tr>
										<td> Commune : ${d.NOM_COMMUN} </td>
										<td> Altitude : ${d.ALTITUDE} </td>
									</tr>`;
				})
				O.updateGraph(d);
			})
			.on('mouseout', function(){
				d3.select(this)
					// .style('z-index', 10000000)
					.transition()
					.duration(200)
					.attr('r', 6);
					tooltipMap.transition()
										.duration(200)
										.style('opacity', 0);

			});
		}, 1000);
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
	  margin = {top : 40, right : 60, bottom : 48, left : 75};

	  // Setting dimensions of the svg and padding between each value of the barplot
	  wGraph = $('#graphPart').width() - margin.left - margin.right;
	  hGraph = 400 - margin.top - margin.bottom;

	  // Creating svg, appending attributes
	  svgGraph = d3.select("#graph")
	               .append("svg")
	               .attr("width", wGraph + margin.left + margin.right)
	               .attr("height", hGraph + margin.top + margin.bottom)
	               .append("g")
	               .attr("transform", `translate(${margin.left},${margin.top})`);

		tooltipGraph = d3.select('#graph')
	                   .append('div')
	                   .attr('class', 'tooltipGraph')
										 .style('left', '0px')
										 .style('top', '0px')
										 .style('opacity',0);

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

		svgGraph.append("text")
						.attr('class', 'axisLabel')
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (-65) +","+(hGraph/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
						.style('opacity', 0)
						.text("Population");

    svgGraph.append("text")
						.attr('class', 'axisLabel')
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (wGraph/2) +","+(hGraph-(-45))+")")  // centre below axis
            .style('opacity', 0)
						.text("Zone tampon en mètres");

		svgGraph.append('path')
						.attr('class','line')
						.style('stroke','none');
	}

	O.updateGraph = function(data) {
		// Transforming data
		dataGraph = [];
		for(i = 1; i <= 10; i++){
			string = `pop${i*100}m`;
			dataGraph.push({"size": i*100, "pop": +data[string]});
		}

		// Replacing all falsey values (espacially NaN) with 0
		dataGraph.forEach(function(a){
			a.pop = a.pop || 0;
		})

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

		svgGraph.selectAll('.axisLabel')
						.style('font-weight', 'bold')
						.style('opacity', 1);

		svgGraph.select('.line')
						.transition()
						.duration(1000)
						.attr('d',line(dataGraph))
						.style('stroke','black')
						.style('stroke-width',0.7)
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
						.attr('r',6)
						.style('opacity', 0.7)
						.style('fill','red');

		svgGraph.selectAll('.point')
			.on('mouseover', function(d){
				let cx = d3.select(this).attr('cx');
				let cy = d3.select(this).attr('cy');
				tooltipGraph.html(function(){
					return `${d.pop} habitants desservis <br> pour ${d.size}m`;
				})
				.style('left', `${cx}px`)
				.style('top', `${cy}px`);
				tooltipGraph.transition()
										.duration(100)
										.style('opacity', 0.8);
			})
			.on('mouseout', function(d){
				tooltipGraph.transition()
										.duration(200)
										.style('opacity', 0);
			});

			// Replace part of the labels
				$('text').each(function(){
						let legendText = $(this).text().replace(',',"'");
						$(this).text(legendText);
				});
	}
