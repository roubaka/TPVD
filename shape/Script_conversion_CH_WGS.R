getwd()
setwd("/Users/nvallott/TPVD/shape")

d = read.delim("hectpop_xy.csv",sep=";")
d
## Convert CH y/x to WGS lat
CH.to.WGS.lat <- function (y, x){
	## Converts military to civil and  to unit = 1000km
	## Auxiliary values (% Bern)
	y_coor <- (y - 600000)/1000000
	x_coor <- (x - 200000)/1000000
	## Process lat
	lat <- {16.9023892 +
	3.238272 * x_coor -
	0.270978 * (y_coor^2) -
	0.002528 * (x_coor^2) -
	0.0447   * (y_coor^2) * x_coor -
	0.0140   * (x_coor^3)}
	## Unit 10000" to 1 " and converts seconds to degrees (dec)
	lat <- lat * 100/36
  	return(lat)  
}
## Convert CH y/x to WGS long
CH.to.WGS.lng <- function (y, x){
	## Converts military to civil and  to unit = 1000km
	## Auxiliary values (% Bern)
	y_coor <- (y - 600000)/1000000
	x_coor <- (x - 200000)/1000000
	## Process long
	lng <- {2.6779094 +
	4.728982 * y_coor +
	0.791484 * y_coor * x_coor +
	0.1306   * y_coor * (x_coor^2) -
	0.0436   * (y_coor^3)}
	## Unit 10000" to 1 " and converts seconds to degrees (dec)
  	lng <- lng * 100/36
	return(lng)
}

d$WGSlong <- CH.to.WGS.lng(d$X,d$Y)
d$WGSlat <- CH.to.WGS.lat(d$X,d$Y)

write.csv(d,"hectpop_wgs.csv")
