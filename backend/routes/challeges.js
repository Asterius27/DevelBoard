const express = require('express');
const router = express.Router();
import { drivers } from '../src/main';
import authenticateToken from '../utils/auth';
import { executeQuery } from '../utils/database';

router.use(express.json());

router.use(authenticateToken);

router.post('/' ,(req, resp) => {

    let date=''+req.body.expireDate.year+'-'+req.body.expireDate.month+'-'+req.body.expireDate.day+'T'+req.expireDate.hour+
    ':'+req.expireDate.minute+':00.000';

    let title=req.body.title;

    let challege={
        description: req.body.description,
        language: req.body.language,
        testCases: req.body.testCases
    };

    let jsonData=JSON.stringify(challege);

    var fs = require('fs');

    fs.writeFile("../resources/"+title, jsonData, function(err) {
        if (err) {
            console.log(err);
        }
    });

    executeQuery('CREATE (node:Challenge {title: $title, expireDate: localdatetime($date)} RETURN node',
    {title: title, date: date},
    function (result){
        console.log(result.records[0].get('title'));
        resp.sendStatus(200);
    });

});

router.get('/',(req, resp) => {
    executeQuery('MATCH (node:Challenge) RETURN node.title, node.expireDate', null, 
    function (result){
        challenges=new Array;
        for (chall in result.records){
            challenges.push({title: chall.get('title'), expireDate: chall.get('expireDate')}); //rivedi la data così non va
        }

        resp.sendStatus(200).json(challenges)
    });
});


module.exports = router