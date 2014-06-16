var express = require('express');
var router = express.Router();
var request = require('request');

/*
 * GET playerlist.
 */
router.get('/playerlist', function(req, res) {

    var db = req.db;
    db.collection('playerlist').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * FIND players on Riot.
 */
router.get('/findplayers', function(req, res) {

	var names = req.query.names;

	if (names === '') {
		res.json('');
	}
    // HTTP to Riot API
    request('https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/' + names + '?api_key=92e3166a-42a5-4d36-8a04-b6760df10702', 
        function (error, response, body) {
        
        if (error) {
            console.error('Fetching player from Riot: ', error);
        }
        else if (response.statusCode != 200) {
            console.error('Fetching player from Riot: ', response.statusCode);
        }
        else {
            console.log('Before parsing: ' + body);
            try {
            	// Will have the form { "summoner1name": { summoner1props }, "summoner2name": { summoner2props }}
           		var apiResp = JSON.parse(body);
           		var summoners = new Array();
           		for (name in apiResp) {
           			summoners.push(apiResp[name]);
           		}
           		console.log('Returning: ' + JSON.stringify(summoners));
				res.json(summoners);
            }
            catch (e) {
            	console.error("Parsing Riot API return", e);
            }
        }
    })
        
});

/*
 * POST to adduser.
 */
router.post('/addplayer', function(req, res) {
    var db = req.db;
    var player = req.body;
    console.log(player);
    player.revisionDate = new Number(player.revisionDate).valueOf();
    console.log(player);
    db.collection('playerlist').insert(player, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;

