FROM node:latest
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
RUN npm install -g @angular/cli
COPY . .
EXPOSE 4200
CMD [ "ng", "serve", "--host", "0.0.0.0" ]

#stage 1
#FROM node:latest as node
#WORKDIR /app
#COPY . .
#RUN npm install
#RUN npm run build --prod
#stage 2
#FROM nginx:alpine
#COPY --from=node /app/dist/frontend /usr/share/nginx/html