# WD and data
setwd("/Users/admin/Desktop/-MyFucknUnil-/DataViz/TPVD/data")
list.files(getwd())

##### Manipulating data #####
pts_buff = data.frame(read.csv("pts_buff.csv", header=TRUE, sep=","))

# Loop 10 times - for each buffer size
for (i in 1:10){
  # Define buff size = index * 100 for meters
  buff_Size = i*100;
  # Define filename according to current buffer size
  filename = paste("buffer", buff_Size, ".csv", sep= "");
  # creates dataframe from csv file
  buffer_Val = data.frame(read.csv(filename, header=FALSE, sep=";"));
  # renames column names for merging
  colnames(buffer_Val) = c("NUMERO", buff_Size);
  # merging current data with previous version of dataframe
  pts_buff = merge(pts_buff, buffer_Val, by = "NUMERO");
}

#Cleaning file by extraction
buffers = data.frame(pts_buff$X, pts_buff$Y, pts_buff$NOM, pts_buff$MOYEN_TRAN, pts_buff$ALTITUDE,
                     pts_buff$NUMERO_COM, pts_buff$NOM_COMMUN, pts_buff$`100`, pts_buff$`200`,
                     pts_buff$`300`, pts_buff$`400`, pts_buff$`500`, pts_buff$`600`, pts_buff$`700`,
                     pts_buff$`800`, pts_buff$`900`, pts_buff$`1000`)

colnames(buffers) = c("X", "Y", "NOM", "MOYEN_TRAN", "ALTITUDE", "NUMERO_COM", "NOM_COMMUN", "pop100m", 
                      "pop200m", "pop300m", "pop400m", "pop500m", "pop600m", "pop700m", "pop800m", 
                      "pop900m", "pop1000m")

write.csv(buffers, file = "/Users/admin/Desktop/-MyFucknUnil-/DataViz/TPVD/data/buffers.csv")

?write.csv()
##### Random tests #####
pts_buff = data.frame(read.csv("pts_buff.csv", header=TRUE, sep=","))

# Replacing NA values into dataframe
pts_buff[is.na(pts_buff)] <- 0

# Histogram o for all values
hist(pts_buff$buff100_SU)
hist(pts_buff$buff250_SU)
hist(pts_buff$buff500_SU)
hist(pts_buff$buff1000_S)

# Ranking of values
ranking100 = sort(pts_buff$buff100_SU, decreasing = TRUE)
ranking250 = sort(pts_buff$buff250_SU, decreasing = TRUE)
ranking500 = sort(pts_buff$buff500_SU, decreasing = TRUE)
ranking1000 = sort(pts_buff$buff1000_S, decreasing = TRUE)

# Empty vector for rank values
rank_all = vector(mode = "numeric", length = 2375)
for (i in 1:2375) {
  rank_all[i] = i
}

# Plot of values
plot(rank_all, log(ranking100))
plot(rank_all, log(ranking250))
plot(rank_all, log(ranking500))
plot(rank_all, log(ranking1000))
