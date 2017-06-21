MENU = {};

let domains = {}; //Values of dropdown for domain and themes

// Methods to get the size of the browser viewport
var windowHeight = $(window).height();  // returns height of browser viewport
var windowWidth = $(window).width();  // returns width of browser viewport

// *************************************************************
// *************************************************************
// ********************* GLOBAL VARIABLES **********************
// *************************************************************
// *************************************************************

// Map representation variables
let mapPrev;  //Previous type of the map
let mapRepr;  //Current type the map

// Map related indicators and urls
let mapRelCol;  //Secondary indicator related to colors
let mapRelSize; //Secondary indicator related to size

let mapColUrl;  //Color related indicator
let mapSizeUrl; //URL of the size related indicator

// Map tooltips and titles
let mapColTooltip = ""; //Tooltip of the color related indicator
let mapSizeTooltip = "";  //Tooltip of the size related indicator
let mapTitle = "";  //Title of the map

// Graph representation variables
let graphPrev;  //Previous type of the graphic
let graphRepr;  //Current type the graphic

// Chart related indicators and urls
let scatRelY; //Y axis related indicator
let scatRelSize;  //Size related indicator
let scatRelCol; //Color related indicator

let scatYUrl; //Y axis indicator URL
let scatSizeUrl;  //Size indictator URL
let scatColUrl; //Color indicator URL

// Scatterplot tooltips
let graphTooltipX = ""; //Tooltip of the X axis indicator
let graphTooltipY = ""; //Tooltip of the Y axis indicator
let graphTooltipS = ""; //Tooltip of the size related indicator
let graphTooltipC = ""; //Tooltip of the color related indicator

// Array to stock the infos from multiples json for the graph
let arrayGraph = [];

let colorScaleRange = []; //Color scale of the map
let colorScaleRangeScat = []; //Color scale of the graphic

// Labels of tooltips of the map
mapLabel1 = mapLabel2 = undefined;

// Types of transitons
let tIn = d3.transition()
.duration(600)
.ease(d3.easeCubicIn);

let tOut = d3.transition()
.duration(600)
.ease(d3.easeCubicOut);

// *************************************************************
// ****************** PAGE RELATED FUNCTIONS *******************
// *************************************************************

//Main function, builds the selector, the map and graph
MENU.main = function(){
  d3.json("/dt", function(error, dt){
    if(error){
      console.log(error);
    }

    //Storing the domain/themes values from database
    domains = dt;

    MENU.buildDomainDropdown();
    MENU.changeUrl();
    setTimeout(function() { // Wait so the url are correctly loaded
      MENU.buildMap(),
      MENU.buildGraph();
    }, 1000);
  })
};

// Build the domain dropdown
MENU.buildDomainDropdown = function(){

  d3.select("#dropdown-domains")
    .append("select")
    .attr("class", "form-control")
    .on("change", MENU.updateThemeDropdown)
    .selectAll("option")
    .data(domains.domains)
    .enter()
    .append("option")
    .attr("value", function(d, i){
      return i;
    })
    .text(function(d){
      return d.name;
    });

    // To update graph when only domain is changed
    d3.select("#dropdown-domains")
      .on("change", function(){
        MENU.changeUrl();
        setTimeout(function(){
          MENU.updateMap();
          MENU.updateGraph();
        }, 300);
      });

  MENU.buildThemeDropdown();
};

//Build the theme dropdown
MENU.buildThemeDropdown = function(){
  d3.select("#dropdown-themes")
    .append("select")
    .attr("class", "form-control")
    .on("change", function(){
      MENU.changeUrl();
      setTimeout(function(){
        MENU.updateMap();
        MENU.updateGraph();
      }, 300);
    });

  MENU.updateThemeDropdown();
};

// Function to update the theme according to the domains
MENU.updateThemeDropdown = function(){
  let selectedDomain = d3.select("#dropdown-domains select").property('value');
  let menuItems = d3.select("#dropdown-themes select")
  .selectAll("option")
  .data(domains.domains[selectedDomain].themes)
  .attr("value", function(d, i){
    return i;
  })
  .text(function(d){
    return d;
  });

  menuItems
    .enter()
    .append("option")
    .attr("value", function(d, i){
      return i;
    })
    .text(function(d){
      return d;
    });

  menuItems
    .exit()
    .remove();
};

MENU.changeUrl = function(){
  // Store current representations as the current one
  mapPrev = mapRepr;
  graphPrev = graphRepr;

  // Check which domain and theme are currently selected
  let selectedDomain = d3.select("#dropdown-domains select").property("value");
  let selectedTheme = d3.select("#dropdown-themes select").property("value");

  // Change the Url to the actual domain and theme
  dataUrl = `/d${selectedDomain}t${selectedTheme}`;

  // This loads the json containing the styles and changes the URL accordingly
  d3.json("/style", function(error, style) {
    if(error) {
      console.log(error);
    }
    // Index to know which object in the array is taken
    let index;

    // (Re)initialise the related indicator to undefined
    mapRelCol = mapRelSize = undefined;
    scatRelY = scatRelSize = scatRelCol = undefined;

    mapColUrl = mapSizeUrl = undefined;
    scatYUrl = scatSizeUrl = scatColUrl = undefined;

    // This loop check the style and affect the related indicators to the correct URL
    for (let i=0; i < style.length; i++) {
      if (`/${style[i].indic}` == dataUrl) {
        index = i;
        mapTitle = style[i].mapTitle;
        graphTitle = style[i].graphTitle;
        colorScaleRange = style[i].color;
        // If the indicator is represented by a choropleth map
        if (style[i].mapStyle == "cr") {
          if (style[i].mapRelCol){
            mapRelCol = style[i].mapRelCol;
          } else {
            mapRelSize = style[i].mapRelSize;
          }
          // Affect URL depanding if the related is whether size or color
          if(mapRelCol) {
            mapSizeUrl = dataUrl;
            mapColUrl = `/${mapRelCol}`;
          } else {
            mapSizeUrl = `/${mapRelSize}`;
            mapColUrl = dataUrl;
          }
          // Assignment for tooltip labels of the map
          for(var k in style){
            if(mapColUrl == `/${style[k].indic}`){
              mapColTooltip = style[k].labelTooltip;
            }
            if(mapSizeUrl == `/${style[k].indic}`){
              mapSizeTooltip = style[k].labelTooltip;
            }
          }
        } else {
          mapSizeUrl = dataUrl;
          mapColTooltip = style[index].labelTooltip;
          mapSizeTooltip = style[index].labelTooltip;
        }
        // If the indicator is represented by a scatterplot affect URLs accrodingly to related indicators
        if (style[i].graphStyle == "scat") {
          if (style[i].scatRelY){
            scatRelY = style[i].scatRelY;
            scatYUrl = `/${scatRelY}`;
          }
          if (style[i].scatRelSize){
            scatRelSize = style[i].scatRelSize;
            scatSizeUrl = `/${scatRelSize}`;
          }
          if (style[i].scatRelCol){
            scatRelCol = style[i].scatRelCol;
            scatColUrl = `/${scatRelCol}`;
          }
        }
        // Assignment for tooltip labels of the graph
        for(var k in style){
          if(dataUrl == `/${style[k].indic}`){
            graphTooltipX = style[k].labelTooltip;
          }
          if(scatYUrl == `/${style[k].indic}`){
            graphTooltipY = style[k].labelTooltip;
          }
          if(scatSizeUrl == `/${style[k].indic}`){
            graphTooltipS = style[k].labelTooltip;
          }
          if(scatColUrl == `/${style[k].indic}`){
            graphTooltipC = style[k].labelTooltip;
            colorScaleRangeScat = style[k].color;
          }
        }
      }
    }
    // Change the current representation styles
    mapRepr = style[index].mapStyle;
    graphRepr = style[index].graphStyle;
  });
};

// *************************************************************
// *************************************************************
// ************************ MAP SECTION ************************
// *************************************************************
// *************************************************************

// Initialise the map on load (whatever indicator is chosen)
MENU.buildMap = function(){

  // Define width and height of the map svg
  wMap = $('.col-lg-6').width();
  hMap = 450;

  // Define the projection used to render the geojson
  let projection = d3.geoMercator()
                     .center([7.5, 46.22])
                     .scale(17900)
                     .translate([wMap/2, hMap/2]);

  //Link the defined projection to the path
  path = d3.geoPath().projection(projection);

  //Define the color scale range of quantitative indicator
  colorRt = d3.scaleQuantize()
              .range(colorScaleRange);
  //Define the color scale range of categorial indicator | colorbrewer only has a max of 12
  colorCat = d3.scaleOrdinal()
               .range(colorScaleRange);

  // Define the range of the proportionnal symbols
  radius = d3.scaleSqrt()
             .range([2.5,25]);

  //Append the svg to the body of the html, with defined w and h
  svgMap = d3.select("#map")
             .append("svg")
             .attr("width", wMap)
             .attr("height", hMap);

  // Add the tooltip to the svg
  tooltipMap = d3.select('#map')
                 .append('div')
                 .attr('class', 'hidden tooltip');

  // This makes the map according to the first indicator
  d3.json("/geom", function(error, geom) {
    if(error) {
      console.log(error);
    }
    // Make grey polygons and prop symbols with r = 0
    MENU.initBaseLayer(geom);

    // If indicator has prop. symbols
    if(mapRepr == "cr" || mapRepr == "t") {

      // Load the sizeData
      d3.json(dataUrl, function(error, sizeData){
        if(error) {
          console.log(error);
        }
        // Append the data to the geometries on the map
        MENU.appendSizeData(geom, sizeData);

        // Check whether symbols are colored
        if(mapRepr == "cr"){
          // Load the colorData
          d3.json(mapColUrl, function(error, sizeColorData){
            if(error) {
              console.log(error);
            }
            // Append the data to the geometries on the map
            MENU.appendColorToSize(geom, sizeColorData);
            // Update (size and color of) symbols accordingly
            MENU.updateBubble(geom);
            // Define numbers of decimals on legend depending on max value
            MENU.defineDecimal(sizeColorData);
            // Draw the legend with the correct colorScale and data
            MENU.makeColorLegend(colorRt,sizeColorData);
          });
        } else {
          // Update (size of) symbols accordingly
          MENU.updateBubble(geom);
        }
      });
      // Else modify only the polygons
    } else {
      // Load the choropleth data
      d3.json(dataUrl, function(error, data){
        if(error) {
          console.log(error);
        }
        // Change the color of the communes
        MENU.updateChoropleth(geom, data);
      });
    }
  });
  MENU.changeTitle();
};

// Making choropleth map - updates colors of polygons according to related values
MENU.updateChoropleth = function(geom, data) {
  //Define the color domain according to the data
  colorRt.domain([
      d3.min(data, function(d) {return d.value;}),
      d3.max(data, function(d) {return d.value;})
  ]);
  colorCat.domain(data, function(d){return d.value;})

  //Retrieve the id of the data and link it to the geospatial geoid
  for (let i = 0; i < data.length; i++) {
    //Grab the commune geoID
    let dataId = data[i].geoid;
    //For each entity in the geojson get the geoID and assign the data value (if there is a corresponding one)
    for (let j=0; j < geom.com.features.length; j++) {
      let jsonId = geom.com.features[j].properties.geoid;
      if (dataId == jsonId) {
        geom.com.features[j].properties.value = data[i].value;
        break;
      }
    }
  }

  // Update color of the polgons according to current values
  svgMap.selectAll("path")
        .data(geom.com.features)
        .style("stroke", "darkGray")
        .style("stroke-width", "0.4")
        .transition()
        .duration(600)
        .style("fill", function(d) {
          let value = d.properties.value;
          // For choropleth map, use corresponding scale
          if (mapRepr == "c"){
            if (value) {
              return colorRt(value);
            } else {
              return "#ccc";
            }
          // For nominal map, use corresponding scale
          } else if(mapRepr == "n"){
            if (value) {
              return colorCat(value);
            } else {
              return "#ccc";
            }
          }
        });

  // Update tooltip of polygons according to values
  svgMap.selectAll("path")
      .data(geom.com.features)
      .on("mouseover", function(d) {
            d3.select(this)
              .transition()
              .duration(200)
              .style("stroke-width", "0.4")
              .style("stroke", "black");
       })
       .on('mousemove', function(d) {
            let innerHTML;
            if(d.properties.value){
              innerHTML = d.properties.nom + "</br>"
                        + mapSizeTooltip + ": " + d.properties.value;
            } else {
              innerHTML = d.properties.nom;
            }
             let mouse = d3.mouse(svgMap.node()).map(function(d) {
                 return parseInt(d);
             });
             tooltipMap.classed('hidden', false)
                       .attr('style', 'left:' + (mouse[0] + 20) +
                               'px; top:' + (mouse[1] - 20) + 'px')
                       .html(innerHTML);
      })
      .on("mouseout", function(d) {
            tooltipMap.classed('hidden', true); // hide labels
            d3.select(this)
              .transition()
              .duration(200)
              .style("fill", function(d) {
                let value = d.properties.value;
                if (mapRepr == "c"){
                  if (value) {
                    return colorRt(value);
                  } else {
                    return "#ccc";
                  }
                } else if(mapRepr == "n"){
                  if (value) {
                    return colorCat(value);
                  } else {
                    return "#ccc";
                  }
                } else {
                  return "#ccc";
                }
              })
              .style("stroke", "darkGray")
              .style("stroke-width", "0.4");
      });

  // Define numbers of decimals on legend depending on max value
  MENU.defineDecimal(data);

  // Make legend according to representation type of the map
  let legendType;
  if(mapRepr == "c"){
    legendType = colorRt;
  } else {
    legendType = colorCat;
  }
  MENU.makeColorLegend(legendType,data);
};

// Initialize polygons and circles for bubble map
MENU.initBaseLayer = function(geom) {

  // Polygons with gray fill
  svgMap.selectAll("path")
        .data(geom.com.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "#ccc")
        .style("stroke", "#fff");

  // Map circles with radius 0 on centroid of polygons
  svgMap.append("g")
        .selectAll("circle")
        .data(geom.cent.features)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        // Place circles according to centroids
        .attr("transform", function(d){
          return `translate(${path.centroid(d)})`;
        })
        .attr("r",0)
        .style("fill","ccc")
        .style("stroke", "#fff")
        .style("stroke-width", "0.4");
};

// Adds size value to the circles of the bubble map
MENU.appendSizeData = function(geom, sizeData) {
  if(d3.min(sizeData, function(d) {return d.value;})===0){
    radius.domain([1,d3.max(sizeData, function(d) {return d.value;})])
  } else {
    radius.domain([d3.min(sizeData, function(d) {return d.value;}),
                   d3.max(sizeData, function(d) {return d.value;})]
    );
  }

  //Retrieve the id of the data and link it to the geospatial geoid
  for (let i = 0; i < sizeData.length; i++) {
    //Grab the commune geoID
    let dataId = sizeData[i].geoid;
    //For each entity in the geojson get the geoID and assign the data value (if there is a corresponding one)
    for (let j=0; j < geom.cent.features.length; j++) {
      let jsonId = geom.cent.features[j].properties.geoid;
      if (dataId == jsonId) {
        geom.cent.features[j].properties.value = sizeData[i].value;
        break;
      }
    }
  }
};

// Adds color value to the circle of the bubble map
MENU.appendColorToSize = function(geom, sizeColorData) {
  colorRt.domain([
      d3.min(sizeColorData, function(d) {return d.value;}),
      d3.max(sizeColorData, function(d) {return d.value;})
  ]);

  //Retrieve the id of the data and link it to the geospatial geoid
  for (let i2 = 0; i2 < sizeColorData.length; i2++) {
    //Grab the commune geoID
    let dataId2 = sizeColorData[i2].geoid;
    //For each entity in the geojson get the geoID and assign the data value (if there is a corresponding one)
    for (let j2=0; j2 < geom.cent.features.length; j2++) {
      let jsonId2 = geom.cent.features[j2].properties.geoid;
      if (dataId2 == jsonId2) {
        geom.cent.features[j2].properties.value2 = sizeColorData[i2].value;
        break;
      }
    }
  }
};

// Returns label format based upon max value
MENU.defineDecimal = function (sizeColorData) {
  if (d3.max(sizeColorData, function(d){return d.value;}) > 100){
    return ".0f";
  } else {
    return ".1f";
  }
};

// Makes a legend for choropleth map
MENU.makeColorLegend = function (colorRange, format) {
  MENU.removeColorLegend();
  // Define legend according to data
  legend = d3.legendColor()
             .labelFormat(d3.format(MENU.defineDecimal(format)))
             .useClass(false)
             .ascending(true)
             .title(`${mapColTooltip}`)
             .scale(colorRange);

  // Append svg legend to the map
  svgMap.append("g")
        .attr("class", "legendColor")
        .attr("transform", "translate(20,20)");

  // Add legend element to the svg element
  svgMap.select(".legendColor")
        .call(legend);

  // Placing the legend
  svgMap.select('.legendColor .legendCells')
        .attr("transform", "translate(0,10)");

  MENU.changeLegend();
};

// Updates layout of the legend when loaded
MENU.changeLegend = function(){
  // Replace part of the labels
  $(document).ready(function() {
    $('.label').each(function(){
        let legendText = $(this).text().replace('to','-');
        $(this).text(legendText);
    });

    // To remove the last class of legend on nominal map
    if(mapRepr == "n"){
        $('.legendCells g').last().remove();
    }
  });
};

// Updates title of map and graphic
MENU.changeTitle = function(){
  $('#mapTitle').text(`${mapTitle}`);
  $('#graphTitle').text(`${graphTitle}`);
};

// Makes legend for bubble map
MENU.makeSizeLegend = function(rayon, trX, trY) {
  circleLegend = d3.legendSize()
                   .scale(rayon)
                   .shape("circle")
                   .cells(3)
                   .labelFormat(".0f")
                   .labelAlign("middle")
                   .labelOffset(17)
                   .title(`${mapSizeTooltip}`)
                   .orient("horizontal");

    // Append svg legend to the map
    svgMap.append("g")
          .attr("class", "legendSize")
          .attr("transform", `translate(${trX},${trY})`)//TODO check legend transformation
          .style("fill", "fff")
          .style("stroke", "darkGray");

    // Add legend elemen to the svg element
    svgMap.select(".legendSize")
          .call(circleLegend);

    d3.selectAll(".label")
      .style("fill", "#000")
      .style("stroke-width", "0");

    // Placing the legend
    svgMap.select('.legendSize .legendCells')
          .attr("transform","translate(0,30)");

    svgMap.select('.legendSize .legendTitle')
          .attr("transform","translate(0,-5)");
};

// Making bubble map - updates size and color of the circles
MENU.updateBubble = function(geom){

    // Change transition duration according to previous map
    let transitionTime = 0;
    if(mapPrev == "cr" || mapPrev == "t"){
      transitionTime = 600;
    }

    // Updating size and color of the circles according to values
    svgMap.selectAll(".bubbles")
          // Sorting the circle so smaller ones are above
          .data(geom.cent.features.sort(function(a,b){
            return b.properties.value - a.properties.value;
          }))
          // Reduce size of the circles
          .transition(tOut)
          .duration(transitionTime)
          .attr("r", 0.1)
          .transition()
          .duration(0)
          .style("fill", function(d) {
            let value = d.properties.value2;
            if (value >= 0) {
              return colorRt(value);
            } else {
              return "purple";
            }
          })
          // Place circles according to centroids
          .transition()
          .duration(0)
          .attr("transform", function(d){
            return `translate(${path.centroid(d)})`;
          })
          .transition(tOut)
          .duration(600)
          // Redefine size of the circles according to related value
          .attr("r", function(d){
            if(d.properties.value!==0){
              return radius(d.properties.value);
            }
          })
          .style("stroke", "#fff")
          .style("stroke-width", "0.4");

  // Update tooltip of circles according to values
  svgMap.selectAll(".bubbles")
        .data(geom.cent.features)
        .on("mouseover", function(d) {
              d3.select(this)
                .transition()
                .duration(100)
                .style("stroke-width", "0.4")
                .style("stroke", "black");
         })
        .on('mousemove', function(d) {
          let mouse = d3.mouse(svgMap.node()).map(function(d) {
            return parseInt(d);
          });
          let innerHTML;
          innerHTML = d.properties.nom
                    + "</br>" + mapSizeTooltip + ": " + d.properties.value;
          if(d.properties.value2 >= 0){
            innerHTML += "</br>" + mapColTooltip + ": " + d.properties.value2;
          }
          tooltipMap.classed('hidden', false)
                    .attr('style', 'left:' + (mouse[0] +20) +
                            'px; top:' + (mouse[1] -20) + 'px')
                    .html(innerHTML);
       })
       .on("mouseout", function(d) {
         tooltipMap.classed('hidden', true); // hide labels
         d3.select(this)
           .transition()
           .duration(200)
           .style("fill", function(d) {
                let value = d.properties.value2;
                if (value >= 0) {
                  return colorRt(value);
                } else {
                  return "purple";
                }
            })
            .style("stroke", "#fff")
            .style("stroke-width", "0.4");
        });
};

// Re(Initialize) polygon of base layer to gray fill
MENU.updateBaseLayer = function(geom){
  d3.selectAll("path")
    .data(geom.com.features)
    .transition(tOut)
    .duration(600)
    .style("fill", "#ccc")
    .style("stroke", "darkGray");
};

// Update size legend of the map
MENU.updateSizeLegend = function(rayon, trX, trY){
  MENU.removeSizeLegend();
  MENU.makeSizeLegend(rayon, trX, trY);
};

//Remove circles from the map
MENU.removeBubbles = function(){
  d3.selectAll(".bubbles")
    .transition()
    .duration(600)
    .attr("r",0.1);

    MENU.removeSizeLegend();
};

// Remove legend of bubble map
MENU.removeSizeLegend = function(){
    $('.legendSize').remove();
};

// Remove legend of choropleth map
MENU.removeColorLegend = function(){
    $('.legendColor').remove();
};

// Updates the map - call functions according to previous and current representation
MENU.updateMap = function(){
  MENU.changeTitle();
  colorRt.range(colorScaleRange);
  colorCat.range(colorScaleRange);

  //Loading the geometry json
  d3.json("/geom", function(error, geom){
    if(error){
      console.log(error);
    }
    // From Choropleth
    if(mapPrev == "c" || mapPrev == "n"){
      // To choropleth or nominal
      if(mapRepr == "c" || mapRepr== "n"){
        d3.json(dataUrl, function(error, data){
          if(error){
            console.log(error);
          }
          MENU.updateChoropleth(geom, data);
        });
      } else
      // To bubble map
      if(mapRepr == "cr" || mapRepr == "t"){
          MENU.updateBaseLayer(geom);

          d3.json(mapSizeUrl, function(error, sizeData){
            if(error){
              console.log(error);
            }
            MENU.appendSizeData(geom, sizeData);

            // Bivariate bubble map
            if(mapRepr == "cr"){
              d3.json(mapColUrl, function(error, sizeColorData){
                // Check if the file is correctly loaded
                if(error) {
                  console.log(error);
                }
                MENU.appendColorToSize(geom, sizeColorData);
                MENU.updateBubble(geom);
                MENU.makeColorLegend(colorRt,sizeColorData);
                MENU.makeSizeLegend(radius,20,350);
              });
            // Simple bubble map
            } else {
              MENU.removeColorLegend();
              MENU.updateBubble(geom);
              MENU.makeSizeLegend(radius,20,25);
            }
          });
      }
    } else
      // From Bubble map
      if(mapPrev == "cr" || mapPrev == "t"){
        // To choropleth or nominal
        if(mapRepr == "c" || mapRepr == "n"){
          MENU.removeBubbles();

          d3.json(dataUrl, function(error, data){
            if(error){
              console.log(error);
            }
          MENU.updateChoropleth(geom, data);
          });
        }
        // To bubble map
        if(mapRepr == "cr" || mapRepr == "t"){
          d3.json(mapSizeUrl, function(error, sizeData){

            // Check if the file is correctly loaded
            if(error) {
              console.log(error);
            }
            MENU.appendSizeData(geom, sizeData);

        // Bivariate bubble map
        if (mapRepr == "cr"){
          d3.json(mapColUrl, function(error, sizeColorData){
            MENU.updateSizeLegend(radius,20,350);
            MENU.appendColorToSize(geom,sizeColorData);
            MENU.updateBubble(geom);
            MENU.makeColorLegend(colorRt,sizeColorData);
          });
        // Simple bubble map
        } else {
          MENU.removeColorLegend();
          MENU.updateBubble(geom);
          MENU.updateSizeLegend(radius,20,20);
          }
        });
      }
    }
  });
};

// // *************************************************************
// // *************************************************************
// // *********************** GRAPH SECTION ***********************
// // *************************************************************
// // *************************************************************

// Initialize all basic components for the graph section
MENU.buildGraph = function(){
  // Creating margins for the svg
  margin = {top : 10, right : 10, bottom : 20, left : 40};

  // Setting dimensions of the svg and padding between each value of the barplot
  wGraph = $('.col-lg-6').width() - margin.left - margin.right;
  hGraph = 450 - margin.top - margin.bottom;

  // Creating svg, appending attributes
  svgGraph = d3.select("#graph")
               .append("svg")
               .attr("width", wGraph + margin.left + margin.right)
               .attr("height", hGraph + margin.top + margin.bottom)
               .append("g")
               .attr("transform", `translate(${margin.left},${margin.top})`);

  // Determining x & y coordinates scaled to the data
  yScaleGraph = d3.scaleLinear().range([hGraph,0]);
  xScaleGraph = "";
  graphColorCat = colorCat;
  sizeScaleScat = d3.scaleSqrt().range([1.5,25]);

  tooltipGraph = d3.select('#graph')
                   .append('div')
                   .attr('class', 'hidden tooltip');

  d3.json(dataUrl, function(error, dataGraph){
    if(error){
     console.log(error);
    }
    // Stores data into an array and creates graph
    MENU.jsonToArray(dataGraph);
    MENU.initGraph(arrayGraph);
  });
};

// Storing the data into an array with global scope
MENU.jsonToArray = function(data){
  for (i = 0; i < data.length; i++){
    arrayGraph.push({
      id : i,
      geoid: data[i].geoid,
      name: data[i].libgeo,
      valueX: data[i].value
    });
  }
};

// Adds Y axis data into the array
MENU.appendScatY = function(data) {
  for (i = 0; i < arrayGraph.length; i++){
    arrayGraph[i].valueY = data[i].value;
  }
};

// Adds size data into the array
MENU.appendScatSize = function(data) {
  for (i = 0; i < arrayGraph.length; i++){
    arrayGraph[i].valueS = data[i].value;
  }
};

// Adds color data into the array
MENU.appendScatColor = function(data){
  for (i = 0; i < arrayGraph.length; i++){
    arrayGraph[i].valueC = data[i].value;
  }
};

// Adds rectangles, circles and tooltips to the graph
MENU.initGraph = function(array){
  xScaleGraph = d3.scaleBand().rangeRound([0,wGraph]);
  xScaleGraph.domain(array.map(function(d){
    return d.valueX;
  }));

  // Creating rectangles for the barplot and their tooltip
  svgGraph.selectAll(".bar")
          .data(array)
          .enter()
          .append("rect")
          .attr("class","bar")
          .attr("x", function(d){
            return xScaleGraph(d.name);
          })
          .attr("y",hGraph)
          .attr("width",0) //width and height of 0 so they are invisible
          .attr("height",0);

  svgGraph.selectAll(".bar")
        .on("mouseover", function(d){
          d3.select(this)
            .style("stroke-width", "0.4")
            .style("stroke", "black");
        })
        .on('mousemove', function(d) {
          var mouse = d3.mouse(svgGraph.node()).map(function(d) {
            return parseInt(d);
          });
          tooltipGraph.classed('hidden', false)
                      .attr('style', 'left:' + (mouse[0] + 20) +
                            'px; top:' + (mouse[1] - 20) + 'px')
                      .html(d.name + "</br>" + d.valueX);
        })
        .on("mouseout", function(d){
          tooltipGraph.classed('hidden', true); // hide labels
          d3.select(this)
            .transition()
            .duration(200)
            .style("stroke-width", "0");
          });

  // Creates circles and their tooltip for the barplot
  svgGraph.selectAll(".dot")
          .data(array)
          .enter()
          .append("circle")
          .attr("class","dot")
          .attr("r",0) //Radius of 0 so they are invisible
          .attr("cx", wGraph/2)
          .attr("cy",hGraph/2)
          .style("fill", "white");

  svgGraph.selectAll(".dot")
        .on("mouseover", function(d) {
            d3.select(this)
              .style("stroke-width", "1")
              .style("stroke", "black")
            })
          .on('mousemove', function(d){
            var mouse = d3.mouse(svgGraph.node()).map(function(d) {
              return parseInt(d);
            });
            let innerHTML = d.name
                          + "</br>" + graphTooltipX + ": " + d.valueX
                          + "</br>" + graphTooltipY + ": " + d.valueY;
            if(d.valueS){
              innerHTML += "</br>" + graphTooltipS + ": " + d.valueS;
            }
            if(d.valueC){
              innerHTML += "</br>" + graphTooltipC + ": " + d.valueC;
            }
            tooltipGraph.classed('hidden', false)
                        .attr('style', 'left:' + (mouse[0] + 60) +
                              'px; top:' + (mouse[1] - 25) + 'px')
                        .html(innerHTML);
        })
        .on("mouseout", function(d) {
            tooltipGraph.classed('hidden', true); // hide labels
            d3.select(this) // reinitialize border map
            .transition()
              .duration(200)
              .style("stroke-width", "0.3")
              .style("stroke", "black")
              .style("fill", function(d){
                if(d.valueC){
                  return graphColorCat(d.valueC);
                } else {
                  return "rgb(123, 204, 196)";
                }
              });
  });

  // Appending x axis to the graph
  svgGraph.append("g")
   .attr("class", "axis xAxis")
   .attr("transform", `translate(0,${hGraph})`)
   .call(d3.axisBottom(xScaleGraph).tickFormat("").tickSize(0)); // hé ho l'axe

  svgGraph.select(".axis.xAxis")
          .append("text")
          .attr("class", "axisLabelX")
          .attr("x", wGraph)
          .attr("y", -3)
          .style("text-anchor", "end")
          .text("");

  // Appending y axis to the graph
  svgGraph.append("g")
          .attr("class", "axis yAxis")
          .call(d3.axisLeft(xScaleGraph).tickFormat("").tickSize(0));

   svgGraph.select(".axis.yAxis")
           .append("text")
           .attr("class", "axisLabelY")
           .attr("transform", "rotate(-90)")
           .attr("dy", ".71em")
           .style("text-anchor", "end")
           .text("");

   MENU.updateGraph();
};

// Update axis parameters according to type of graph
MENU.updateAxis = function(bool) {

  svgGraph.select(".axis.yAxis")
          .transition()
          .duration(1000)
          .call(d3.axisLeft(yScaleGraph));

  let yLabelTranslate = 6;
  if (bool){
    yLabelTranslate = 20;
    graphTooltipY = graphTooltipX;
  }

  svgGraph.select(".axisLabelY")
          .transition()
          .duration(600)
          .attr("y", yLabelTranslate)
          .text(`${graphTooltipY}`);

  // Update X axis for barplot
  if (bool) {
    $('.axisLabelX').hide();
    svgGraph.select(".axis.xAxis")
    .transition()
    .duration(1000)
    .call(d3.axisBottom(xScaleGraph).tickFormat("")
    .tickSize(0));
  // Update X axis for scatterplot
  } else {
    $('.axisLabelX').show();
    svgGraph.select(".axis.xAxis")
    .transition()
    .duration(1000)
    .call(d3.axisBottom(xScaleGraph));

    svgGraph.select(".axisLabelX")
            .text(`${graphTooltipX}`);
  }
};

// Updates rectangls of the barplot according to values
MENU.updateBar = function(array) {
  // Array needed for the scaleBand
  let domainGraph = [];
  for (i = 0; i < array.length; i++){
    domainGraph[i] = i;
  }

  graphColorRt = colorRt;
  xScaleGraph = d3.scaleBand().rangeRound([0,wGraph]);
  sortScaleBar = d3.scaleOrdinal([0,wGraph]);

  // Setting interval between rectangles according to number of values
  sortScaleBar.domain(array.map(function(d){
    return d.name;
  }));

  let xScaleSort = d3.scaleBand()
                     .range([0,wGraph])
                     .domain(domainGraph);

  xScaleGraph.domain(array.map(function(d){
    return d.name;
  }));

  //Define the color domain according to the data
  graphColorRt.domain([
    d3.min(array, function(d) {return d.valueX;}),
    d3.max(array, function(d) {return d.valueX;})
  ]);

  // Min Max values of the array
  valueXmax = d3.max(array, function(d){
    return d.valueX;
  });
  valueXmin = d3.min(array,function(d){
    return d.valueX;
  });

  // Defining y domain according to the range of the values
  if(valueXmin >= 0){
    yScaleGraph.domain([0, valueXmax]);
  } else {
    yScaleGraph.domain([valueXmin, valueXmax]);
  }

  // Update all rectangles according to values
  svgGraph.selectAll(".bar")
          // Sorting each bar from  bigger to smaller
          .data(array.sort(function(a,b){
            return b.valueX - a.valueX;
          }))
          .transition()
          .duration(600)
          .attr("x", function(d,i){
            return xScaleSort(i);
          })
          .attr("y", function(d){
            if(isNaN(d.valueX)){
              return hGraph;
            } else {
              return yScaleGraph(d.valueX);
            }
          })
          .attr("width", xScaleGraph.bandwidth())
          .attr("height", function(d){
            if(isNaN(d.valueX)){
              return 0;
            } else {
              return hGraph - yScaleGraph(d.valueX);
            }
          })
          .style("fill", function(d){
            var value = d.valueX;
            if (value) {
              return graphColorRt(value);
            } else {
              return "#ccc";
            }
          });

  MENU.updateAxis(true);
};

// Update circles of scatterplot according to values
MENU.updateScat = function(array) {

  graphColorCat.range(colorScaleRangeScat);

  xScaleGraph = d3.scaleLinear().range([0,wGraph]);
  sizeScaleScat = d3.scaleSqrt().range([1.5,25]);

  // Defining x domain according to the range of the values
  xScaleGraph.domain([d3.min(array, function(d){return d.valueX;}),
                      d3.max(array, function(d){return d.valueX;})]);

  // Defining y domain according to the range of the values
  yScaleGraph.domain([d3.min(array, function(d){return d.valueY;}),
                      d3.max(array, function(d){return d.valueY;})]);

  // Defining color domain according to the range of values
  graphColorCat.domain(array, function(d){return d.valueC;})

  // Defining size domain according to the range of values
  sizeScaleScat.domain([d3.min(array, function(d) {return d.valueS;}),
                        d3.max(array, function(d) {return d.valueS;})]);

  svgGraph.selectAll(".dot")
        .data(array.sort(function(a,b){
          return b.valueS - a.valueS;
        }))
        .transition()
        .duration(1200)
        .attr("cx", function(d){
          return xScaleGraph(d.valueX);
        })
        .attr("cy", function(d){
          return yScaleGraph(d.valueY);
        })
        .attr("r", function(d){
          // If X or Y value are null, make value invisible
          if(d.valueS){
            if(d.valueX == null || d.valueY == null){
              return 0;
            } else {
              return sizeScaleScat(d.valueS);
            }
          } else {
            if(d.valueX == null || d.valueY == null){
              return 0;
            } else {
            return 5;
            }
          }
        })
        .style("stroke-width", "0.3")
        .style("stroke", "black")
        .style("fill", function(d){
          if(d.valueC){
            return graphColorCat(d.valueC);
          } else {
            return "rgb(123, 204, 196)";
          }
        });

  MENU.updateAxis(false);
};

// Remove rectangles of the barplot by reducing heigt to 0
MENU.removeBar = function(){
  d3.selectAll(".bar")
    .transition()
    .duration(500)
    .attr("height",0)
    .attr("y", hGraph);
}

// Remove dots of the scatterplot by reducing radius to 0
MENU.removeScat = function(){
  d3.selectAll(".dot")
  .transition()
  .duration(600)
  .attr("r",0);
};

// Update the graphic
MENU.updateGraph = function(){
  // reinitialize arrayGraph
  arrayGraph = [];
  // From barplot
  if(graphPrev == "bar"){
    // From barplot to barplot
    if(graphRepr == "bar"){
      d3.json(dataUrl, function(error, dataBar){
        if(error){
          console.log(error);
        }
        MENU.jsonToArray(dataBar);
        MENU.updateBar(arrayGraph);
      });
    // From barplot to scatter
    } else {
      MENU.removeBar();
      //X values of scatter
      d3.json(dataUrl, function(error, dataX){
        if(error){
          console.log(error);
        }
        MENU.jsonToArray(dataX);

        d3.json(scatYUrl, function(error, dataY){
          if(error){
            console.log(error);
          }
          MENU.appendScatY(dataY);
        });
      });
      //Y values of scatter
      if(scatRelSize){
        d3.json(scatSizeUrl, function(error, dataScatSize){
          if(error){
            console.log(error);
          }
          MENU.appendScatSize(dataScatSize);
        });
      }
      //Color values of scatter
      if(scatColUrl){
        d3.json(scatColUrl, function(error, dataScatCol){
          if(error){
            console.log(error);
          }
          MENU.appendScatColor(dataScatCol);
        });
      }
      // Wait a while
      setTimeout(function(){
        MENU.updateScat(arrayGraph);
      }, 1000);
    }

  // From scatter
  } else {
    // Making barplot
    if(graphRepr == "bar"){
      MENU.removeScat();
      d3.json(dataUrl, function(error, dataBar){
        if(error){
          console.log(error);
        }
        MENU.jsonToArray(dataBar);
        MENU.updateBar(arrayGraph);
      });
      // Making scatterplot
    } else {
      MENU.removeBar();
      //X values of scatter
      d3.json(dataUrl, function(error, dataX){
        if(error){
          console.log(error);
        }
        MENU.jsonToArray(dataX);

        d3.json(scatYUrl, function(error, dataY){
          if(error){
            console.log(error);
          }
          MENU.appendScatY(dataY);
        });
      });
      //Y values of scatter
      if(scatRelSize){
        d3.json(scatSizeUrl, function(error, dataScatSize){
          if(error){
            console.log(error);
          }
          MENU.appendScatSize(dataScatSize);
        });
      }
      //Color values of scatter
      console.log(scatColUrl);
      if(scatColUrl){
        d3.json(scatColUrl, function(error, dataScatCol){
          if(error){
            console.log(error);
          }
          MENU.appendScatColor(dataScatCol);
        });
      }
      // Wait a while
      setTimeout(function(){
        MENU.updateScat(arrayGraph);
      }, 300);
    }
  }
};
