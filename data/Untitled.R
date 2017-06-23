# WD and data
setwd("/Users/admin/Desktop/-MyFucknUnil-/DataViz/TPVD/data")
list.files(getwd())
pts_buff = data.frame(read.csv("pts_buff.csv", header=TRUE, sep=","))

# Replacing NA values into dataframe
pts_buff[is.na(pts_buff)] <- 0

# Histogram of values
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
rank = vector(mode = "numeric", length = 2375)
for (i in 1:2375) {
  rank[i] = i
}

# Plot of values
plot(rank, log(ranking100))
plot(rank, log(ranking250))
plot(rank, log(ranking500))
plot(rank, log(ranking1000))

