# DevelBoard
Software Architecture Project

## Docker commands:

Neo4j (Database):
```
docker run -p7474:7474 -p7687:7687 -e NEO4J_AUTH=neo4j/s3cr3t neo4j
# then open http://localhost:7474 to connect with Neo4j Browser
```

Angular (Frontend):
```
docker build --tag develboard_frontend .
docker run -d -p 80:80 develboard_frontend
```

Node (Backend):
```
docker build --tag develboard_backend .
docker run -d -p 3000:3000 develboard_backend
```
