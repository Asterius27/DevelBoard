const neo4j = require('neo4j-driver');
const timeout = require('timers/promises')

let driver = {};

async function connectTo(){
    await timeout.setTimeout(40000);
    driver = neo4j.driver(
        'bolt://' + process.env.NEO4J_HOST + ':' + process.env.NEO4J_PORT + '/',
        neo4j.auth.basic(process.env.NEO4J_DATABASE, process.env.NEO4J_PASSWORD)
    );
}

async function executeQuery(query, params, fun, errFun){
    let session= await driver.session();
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
