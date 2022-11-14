//https://github.com/neo4j/neo4j-javascript-driver
import { drivers } from '../src/main';
const neo4j = require('neo4j-driver')


export function connectTo(){
    let driver = neo4j.driver(
        'bolt://localhost:7474/',
        neo4j.auth.basic(process.env.NEO4J_DATABASE, process.env.NEO4J_PASSWORD)
    );
    return driver;
}

export async function executeQuery(query, params, fun){
    let session=drivers.session();

    session.run(query, params).subscribe({
        onNext: fun,
        onCompleted: () => {
            session.close()
        },
        onError: error => {
            console.log(error)
          }
    })

}