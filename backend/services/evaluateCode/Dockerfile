FROM node:latest
RUN apt-get update
RUN apt-get -y install openjdk-17-jdk openjdk-17-jre
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
CMD [ "node", "main.js" ]