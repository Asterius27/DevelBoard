const express = require('express');
const { LocalDateTime } = require('neo4j-driver');
const router = express.Router();
const auth = require('../utils/auth');
const db = require('../utils/database');

//router.use(auth.authenticateToken);

router.post('/', (req, res) => {

    let date=''+req.body.expireDate.year+'-'+req.body.expireDate.month+'-'+req.body.expireDate.day+'T'+req.body.expireDate.hour+
    ':'+req.body.expireDate.minute+':00';

    let title=req.body.title;

    let challenge={
        title: title,
        description: req.body.description,
        language: req.body.language,
        testCases: req.body.testCases,
        resultCases: req.body.resultCases,
        expireDate: date
    };

    /*let jsonData=JSON.stringify(challenge);

    var fs = require('fs');

    fs.writeFile("../resources/"+title, jsonData, function(err) {
        if (err) {
            console.log(err);
        }
    });*/

    db.executeQuery(
        'CREATE (node:Challenge {title: $title, expireDate: localdatetime($date), description: $description, language: $language, testCases: $testCases, resultCases: $resultCases}) RETURN node',
        {title: challenge.title, date: challenge.expireDate, description: challenge.description, language: challenge.language, testCases: challenge.testCases,resultCases: challenge.resultCases},
        result => {
            console.log(result.records);
            return res.sendStatus(200);
        },
        error => {
            console.log(error);
            return res.sendStatus(500);
        }
    );

});

router.get('/:title',(req, res) => {
    db.executeQuery('MATCH (node:Challenge {title: $title}) RETURN node.title as title , node.expireDate as expireDate, node.language as language, node.description as description',
        {title: req.params.title}, 
        result => {
            let challenge;
            result.records.forEach(chall => challenge={"title": chall.get("title"), "expireDate": db.dateParse(chall.get("expireDate")), language: chall.get('language'), description: chall.get('description')}); //rivedi la data così non va
            return res.status(200).json(challenge);
        },
        error => {
            console.log(error);
            return res.sendStatus(500);
        }
    );
});

router.get('/',(req, res) => {
    const now=new Date();
    db.executeQuery('MATCH (node:Challenge) WHERE node.expireDate > localdatetime($date) RETURN node.title as title, node.expireDate as expireDate, node.language as language',
        {date: now.toISOString().slice(0,-1)}, 
        result => {
            let challenges=new Array;
            result.records.forEach(chall =>challenges.push({title: chall.get('title'), expireDate: db.dateParse(chall.get('expireDate')), language: chall.get('language')})); //rivedi la data così non va
            return res.status(200).json(challenges);
        },
        error => {
            console.log(error);
            return res.sendStatus(500);
        }
    );
});



router.post('/prova', (req, res) => {

    db.executeQuery(
        'Match (node:Challenge {title: $title}) RETURN node.title as title',
        {title: req.body.title},
        result => {
            result.records.forEach(r => console.log(r.get('title')));
            return res.sendStatus(200);
        },
        error => {
            console.log(error);
            return res.sendStatus(500);
        }
    );
});

module.exports = router