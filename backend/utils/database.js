//https://github.com/neo4j/neo4j-javascript-driver
const neo4j = require('neo4j-driver');

let driver = {};
let session = {};

function connectTo(){
    driver = neo4j.driver(
        'bolt://localhost:7474/',
        neo4j.auth.basic(process.env.NEO4J_DATABASE, process.env.NEO4J_PASSWORD)
    );
    session = driver.session();
}

async function executeQuery(query, params, fun){
    if (session) {
        session.run(query, params).subscribe({
            onNext: fun,
            onCompleted: () => {
                session.close()
            },
            onError: error => {
                console.log(error)
              }
        });
    }

}

module.exports = { connectTo, executeQuery }
