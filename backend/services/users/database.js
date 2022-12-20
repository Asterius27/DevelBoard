//https://github.com/neo4j/neo4j-javascript-driver
//docker run -p7474:7474 -p7687:7687 -e NEO4J_AUTH=neo4j/s3cr3ttt neo4j
const neo4j = require('neo4j-driver');
const timeout = require('timers/promises')

let driver = {};
let session = {};

async function connectTo(){
    await timeout.setTimeout(1000); // TODO not the best solution (25000), have to wait for db and kafka to startup
    driver = neo4j.driver(
        'bolt://' + process.env.NEO4J_HOST + ':' + process.env.NEO4J_PORT + '/',
        neo4j.auth.basic(process.env.NEO4J_DATABASE, process.env.NEO4J_PASSWORD)
    );
    // console.log("connected!");
}

async function executeQuery(query, params, fun, errFun){
    session= await driver.session();
    if (session) {
        await session.run(query, params)
        .then(fun)
        .catch(errFun)
        .then(() => session.close());
    }
}

function dateParse(date){
    let newDate={};
    for (const prop in date){
        newDate[prop]=date[prop].low;
    }
    return newDate;
}

module.exports = { connectTo, executeQuery, dateParse}
