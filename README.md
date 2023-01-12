# DevelBoard
Software Architecture Project. HackerRank-style application where users can undertake coding challenges and see how they compare against other users.

## System Architecture
The application is structured in layers, it is divided in frontend (angular), backend (nodejs/express) and database (neo4j). The frontend only communicates with the backend using the HTTP protocol, the backend communicates with the frontend and the database, and the database only communicates with the backend. 

The backend has a distributed service based structure. It has a proxy layer that receives HTTP requests from the frontend (through express) and forwards them to the correct service for processing (through kafka). So once it receives a request in a certain endpoint, the proxy layer will send a kafka message on the respective topic, then a consumer will read that message from the topic and process it, saving the results in the database (if necessary) and producing a response that gets sent back to the proxy as a message through kafka (if necessary). If a certain request has to wait for a response the proxy will create a kafka consumer that, once the response gets sent back (from the consumer in the service), will forward it as an HTTP response. 

The backend has a number of different services each of which has a number of different kafka consumers (consumers are logically divided into each service). Each service may be duplicated if the application has to scale up, and each service may be further divided by separating each kafka consumer into its own service. The services are all independent of each other and only comunicare with the proxy through kafka and with the database. 

The proxy only comunicates with the frontend (using the HTTP protocol) and with the different services (using kafka). The application will be built and deployed using docker and the different components (frontend, proxy, services, kafka, database) will all run in separate containers, which will communicate as described earlier. Ideally, every container represents a separate machine.

Load balancing of the backend is done automatically through kafka, so each topic, which is assigned to a different consumer group, may be partitioned. When the proxy sends a message to a topic, the message will be sent to a specific partition of that topic according to some logic (by default a round robin logic is used) and then kafka automatically assigns each partition to only one consumer in the consumer group that is assigned to that topic. So if the number of consumers is the same as the number of partitions there will be a one to one correspondence between partitions and consumers. Reassignments of partitions (in case a consumer goes down or new consumers are available) and deletion of read messages are all automatically managed by kafka. 

The database is shared between all services because it's a graph database so it relies heavily on the relationships between the nodes, and therefore it would have been complicated to divide. 

The application is stateless and it uses JSON Web Tokens to manage sessions. This means that for every request (that requires it) the backend checks that a valid JWT is sent together with the request. The JWT sent with the request identifies the user that sends the request and was generated by the backend when the user first logged in (and then it got shared with the user). This way the backend doesn't need to keep track of the sessions but it knows everytime who is making the request. If the user doesn't have a valid token (that gets stored in the localstorage of the user's browser by the frontend) he has to log in again in order to generate a new one.


The frontend is inside the frontend folder and it's divided (at a high level) between components that handle the user interface and services that handle the communication with the backend. Both can be found in frontend/src/app/.

The backend is inside the backend folder and it's divided (at a high level) into routes. Each route handles a specific endpoint, so once it receives a (HTTP) request it sends a kafka message on the correct topic and waits for a response if necessary. The routes can be found in backend/routes.

The services are inside the backend/services folder. Each service launches a number of kafka consumers that will wait for a message on their corresponding topic. Once they receive the message they will process it, update the database if necessary and generate a response if necessary. The consumers are all in the main.js file of each service. Each consumer could have its own service to improve scalability, but this was not considered necessary since by grouping them we still obtain a good enough level of scalability and end up using less resources (because each service runs in a completely separate instance of nodejs).

## General Information and Caveats
This version of the application implements most of the functionalities, but there are still some limitations/stuff to be careful about:

- Only admins can create new challenges (the admin account is the one specified in the env file of the user service, default is email: admin@gmail.com and password: admin)
- When creating a challenge the test cases and the result cases must be formatted following the example given as a place holder in their respective fields
- Users can only undertake challenges once
- In the java code a user submits for a challenge he must provide the main method (defined as public static void main(String[] args))
- Everything the program (written in any language) outputs to standard output will be compared against the expected output (result cases)
- Test cases are passed as args to the main method in java and to sys.argv in python
- All other classes must be declared as static in java
- The application takes a while to build and then launch so please be patient (when using the provided docker compose: \~10 min to build, \~2 min to launch on an average computer, so it might vary)

## Example
For example if our challenge is to write a program that adds two numbers, then our java program would be:
```
public static void main(String args[]) {
    System.out.println(Integer.valueOf(args[0]) + Integer.valueOf(args[1]));
}
```
And the python version would be:
```
import sys

def fun():
    print(int(sys.argv[1])+int(sys.argv[2]))
    
fun()

```

## Build and Deploy
It's recommended to run the application through docker, below are the commands that have to be used to build and run the application. Both commands have to be run in the main folder (where the docker-compose file is located).
```
docker-compose build
docker-compose up
```
Then the application will be available at localhost:4200

If you want to run the application without docker, then:

1. Install kafka and neo4j
2. Update every .env file, there's one for the frontend (they are inside the environments folder), one for the backend and one for every service (iniside backend/services), with the correct values (they will depend on your environment)
3. Beware that lines 76 and 121 of the main.js file inside backend/services/evaluateCode/ depend on the operating system. As they are set they will work in linux, for windows you should change the -3 to -5, for other operating systems you have to see for yourself.
4. Install both python3 and java (both the jdk and jre) in the machine that will run the code evaluation consumer and make sure that the path environment variables (of your os) are set correctly (so that both python and java can be used in a terminal)
5. Install node and npm
6. Install Angular (npm install -g @angular/cli)
7. Run npm install inside the frontend and backend folders, and inside every folder located in backend/services/
8. Make sure kafka and neo4j are running
9. Run npm start inside the frontend and backend folders, and inside every folder located in backend/services/
10. Hopefully the application will be available at localhost:4200 or whatever combination of host-port you have set for the frontend

## Duplicating Services
Every service may be duplicated for scalability purposes. In order to duplicate a service you need to update the .env file inside the backend folder (this will tell the application how many kafka partitions it has to create for each topic regarding that service) and update the docker-compose file in order to duplicate the service container(s). Of course if you are running the application in a different configuration (for example without using docker), then you only need to update the .env file, and the actual duplication of the service will depend on your configuration (though in general it is sufficient to launch another instance of the service you are interested in).

So, for example, if we wanted to duplicate the users service, then:

1. Set the KAFKA_USER_CONSUMER to 2 inside the .env file in the backend folder
2. Add a new service in the docker-compose.yml file by copying the same structure as our original service and changing some values, in particular:
```
users-consumer:
    build:
      context: ./backend/services/users/
      dockerfile: Dockerfile
    restart: unless-stopped
    container_name: develboardusersconsumer
    depends_on:
      - db
      - kafka
      - backend
```
would be copied and modified in the following way (note that you can set them to whatever you want, just don't modify the rest):
```
users-consumer-2:
    build:
      context: ./backend/services/users/
      dockerfile: Dockerfile
    restart: unless-stopped
    container_name: develboardusersconsumer2
    depends_on:
      - db
      - kafka
      - backend
```
And the same applies for every other service. Also, if you want to duplicate a service more than once just increase the number in the .env file and copy and modifiy the same service more than once in the docker-compose.
