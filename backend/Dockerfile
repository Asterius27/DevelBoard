FROM node:latest
RUN apt-get -y install default-jdk
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "main.js" ]