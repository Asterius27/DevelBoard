//https://github.com/neo4j/neo4j-javascript-driver
const neo4j = require('neo4j-driver');

let driver = {};
let session = {};

function connectTo(){
    driver = neo4j.driver(
        'bolt://localhost:7687/',
        neo4j.auth.basic(process.env.NEO4J_DATABASE, process.env.NEO4J_PASSWORD)
    );
    // console.log("connected!");
}

async function executeQuery(query, params, fun, errFun){
    session= driver.session();
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
