const express = require('express');

const router = express.Router();

const {parsePost} = require('./utils');

router.post('/', async (req, res) => res.status(200).send('Hello World'));

router.post('/createPost', async (req, res) => {
    try{
        if(!req.body){
            res.status(500).send('Body is empty');
            return;
        }
        console.log(req.body);
        res.status(200).send('Hello World');
    }catch(err){
        next(err);
    }
});

module.exports = router;