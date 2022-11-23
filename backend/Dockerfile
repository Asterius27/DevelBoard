# Node
FROM node:latest
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "main.js" ]
# Java
# FROM eclipse-temurin:latest