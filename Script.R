# WD and data
setwd("/Users/admin/Desktop/-MyFucknUnil-/DataViz/TPVD/data")
list.files(getwd())
pts_buff = data.frame(read.csv("pts_buff.csv", header=TRUE, sep=","))
s_buff = data.frame(read.csv("s_buff.csv",  header=TRUE, sep=","))
m_buff = data.frame(read.csv("m_buff.csv",  header=TRUE, sep=","))
l_buff = data.frame(read.csv("l_buff.csv",  header=TRUE, sep=","))

# Replacing NA values into dataframe
pts_buff[is.na(pts_buff)] <- 0
s_buff[is.na(s_buff)] <- 0
m_buff[is.na(m_buff)] <- 0
l_buff[is.na(l_buff)] <- 0

# Histogram o for all values
hist(pts_buff$buff100_SU)
hist(pts_buff$buff250_SU)
hist(pts_buff$buff500_SU)
hist(pts_buff$buff1000_S)

# Small buffer
hist(s_buff$buff100_SU)
hist(s_buff$buff1000_S)

hist(m_buff$buff1000_S)
hist(l_buff$buff1000_S)

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
