const { Kafka, logLevel } = require('kafkajs');
const util = require('util');
const fs = require('fs');
const execp = util.promisify(require("child_process").exec);
require('dotenv').config();
const db = require('./database')

console.log('Starting...');
let ready = db.connectTo()
ready.then(() => {
  const kafka = new Kafka({
      logLevel: logLevel.INFO,
      clientId: 'evaluateCode-service',
      brokers: [process.env.KAFKA_HOST + ':' + process.env.KAFKA_PORT],
  })

  const evaluateCodeConsumer = kafka.consumer({ groupId: 'evaluateCode-consumer' })
  async function response(topic, messages) {
    let producer = kafka.producer()
    await producer.connect()
    await producer.send({
      topic: topic,
      messages: messages,
    })
    await producer.disconnect()
  }

  async function evaluateConsumer() {
    await evaluateCodeConsumer.connect()
    await evaluateCodeConsumer.subscribe({ topic: 'evaluateCode', fromBeginning: true })
    await evaluateCodeConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let data = JSON.parse(message.value.toString())
        let challenge = [];
        let score = 0;
        let max_score = 0;
        let compile = false;
        let results = [];
        db.executeQuery('MATCH (node:Challenge {title: $title}) RETURN node.resultCases as resultCases, node.testCases as testCases',
          {title: data.title},
          async result => {
            challenge = result.records[0];
            let i = 0;
            if (!fs.existsSync('./submitted_code')) {
              fs.mkdirSync('./submitted_code');
            }
            let dirName = "./submitted_code/file"+i;
            while(fs.existsSync(dirName)) {
              i = i + 1;
              dirName = "./submitted_code/file"+i;
            }
            fs.mkdirSync(dirName);
            if (data.language === "java") {
              let fileName = "temp."+data.language;
              fs.writeFileSync(dirName + "/" + fileName, data.code);
              try {
                let { stdout, stderr } = await execp("javac "+ dirName + "/" + fileName);
                if (!stderr) {
                  compile = true;
                  let tests = [];
                  let tests_json = challenge.get("testCases").split('; ');
                  let results_json = challenge.get("resultCases").split('; ');
                  tests_json.forEach((test) => tests.push(JSON.parse(test)));
                  results_json.forEach((result) => results.push(JSON.parse(result)));
                  for (let i = 0; i < tests.length; i++) {
                    let args = "";
                    for (let j = 0; j < tests[i].length; j++) {
                      args = args + " " + tests[i][j];
                    }
                    try {
                      let { stdout, stderr } = await execp("java -classpath " + dirName + " Challenge" + args, { timeout: 60000 });
                      if (stderr) {
                        console.log(stderr);
                      }
                      else {
                        let out = JSON.stringify(stdout).slice(1, -3);
                        let res_out = JSON.stringify(results[i][0]);
                        if (res_out.charAt(0) === '"') {
                          res_out = res_out.slice(1, -1);
                        }
                        if (out === res_out) {
                          score = score + 1;
                        }
                      }
                    } catch (e) {
                      console.log(e);
                    }
                  }
                }
                else {
                  console.log(stderr);
                  compile = false;
                }
              } catch (e) {
                let results_json = challenge.get("resultCases").split('; ');
                results_json.forEach((result) => results.push(JSON.parse(result)));
                console.log(e);
                compile = false;
              }
              max_score = results.length;
            }
            if (data.language === "python") {
              let fileName = "temp.py";
              fs.writeFileSync(dirName + "/" + fileName, data.code);
              try {
                compile = true
                let tests = [];
                let tests_json = challenge.get("testCases").split('; ');
                let results_json = challenge.get("resultCases").split('; ');
                tests_json.forEach((test) => tests.push(JSON.parse(test)));
                results_json.forEach((result) => results.push(JSON.parse(result)));
                for (let i = 0; i < tests.length; i++) {
                  let args = "";
                  for (let j = 0; j < tests[i].length; j++) {
                    args = args + " " + tests[i][j];
                  }
                  let { stdout, stderr } = await execp("python3 "+ dirName + "/" + fileName + args, { timeout: 60000 });
                  if (stderr) {
                    console.log(stderr);
                  } else {
                    let out = JSON.stringify(stdout).slice(1, -3);
                    let res_out = JSON.stringify(results[i][0]);
                    if (res_out.charAt(0) === '"') {
                      res_out = res_out.slice(1, -1);
                    }
                    if (out === res_out) {
                      score = score + 1;
                    }
                  }
                }
                max_score = results.length;
              } catch (e) {
                let results = []
                let results_json = challenge.get("resultCases").split('; ');
                results_json.forEach((result) => results.push(JSON.parse(result)));
                console.log(e);
                compile = false;
                max_score = results.length;
              }
            }
            db.executeQuery('MATCH (p:Person), (c:Challenge) WHERE p.email = $email AND c.title = $title CREATE (p)-[r:RELTYPE {score: $score, compile: $compile, max_score: $max_score}]->(c) RETURN type(r)',
              {email: data.email, title: data.title, score: score, compile: compile, max_score: max_score},
              (result) => {
                fs.rmSync(dirName, { recursive: true, force: true });
                let msg = JSON.stringify({score: score, compile: compile, max_score: max_score})
                response(data.response, [{value: msg}])
              }, 
              (err) => {
                console.log("DB Error: " + error)
                response(data.response, [{value: ''}])
              }
            );
          },
          error => {
            console.log("DB Error: " + error)
            response(data.response, [{value: ''}])
          }
        );
        
      },
    })
  }

  evaluateConsumer();
})
