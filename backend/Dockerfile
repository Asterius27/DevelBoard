# Node
FROM node:latest as node
WORKDIR /app
COPY . .
RUN npm install
RUN npm start 
# Java
FROM openjdk:latest 
WORKDIR /app
# Port
EXPOSE 3000