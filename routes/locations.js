var path = require('path');
var util = require('util');
var express = require('express');
var router = express.Router();
var db = require(path.join(global.appRoot, 'model'));

router.get('/',function(req,res,next){
  console.log(req.url);
  console.log('Deep');
})

router.get('/getStates', function (req, res, next) {
    db.zipCodes.aggregate([
        { '$group': { '_id': { state: '$state' } } },
        { '$sort': { '_id.state': 1 } },
        { '$project': { state: '$_id.state', '_id': 0 } }
    ], function (err, items) {
        res.json(items);
    })
});

router.get('/getCitiesFromStates/:state', function (req, res, next) {
    
    let stateVal = req.params.state;
    console.log(stateVal);
    db.zipCodes.aggregate([
        {'$group':{'_id':{city:'$city'}}},
        {'$sort':{'_id.city':1}},
        {'$project':{city:'$_id.city','_id':0}}
    ],function (err, items) {

        res.json(items);
    })
});

router.get('/getZipCodes', function (req, res, next) {
  
  db.zipCodes.find().toArray(function (err, items) {
  console.log(items);

    res.json(items);
  })
});

router.get('/getCitiesFromState/:zipCode', function (req, res, next) {

  var zipCode = req.params.zipCode;

  db.zipCodes.find({ '_id': zipCode }).toArray(function (err, items) {
    res.json(items);
  })
});

router.get('/getItemsFromCities/:city', function (req, res, next) {
  var city = req.params.city;
  console.log(city);
  db.items.find({ 'city': city }).toArray(function (err, items) {
    res.json(items);
  })
})

router.post('/saveItems', function (req, res, next) {
  var itemsData = {
    itemName: req.body.itemName,
    shortDescription: req.body.shortDescription,
    itemDetails: req.body.itemDetails,
    contactInformation: req.body.contactInformation,
    category: req.body.category,
    state: req.body.state,
    city: req.body.city,
    "location": {
      "type": req.body.location.type,
      "coordinates": [req.body.location.coordinates[0], req.body.location.coordinates[0]]
    },
    imgPath: req.body.imgPath
  }

  db.items.insert(itemsData, function (err, docInserted) {
    if (err) throw err;
    console.dir(`Success: $(JSON.stringify(docInserted))`);

    res.send('done');
    return db.close();
  })
})

router.get('/getItemsNearMe', function (req, res, next) {
  var latitude = req.query.latitude;
  var longitude = req.query.longitude;

  console.log(req.query);

  var query = {
    'location': {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: 2000
      }
    }
  }

  db.items.find(query).toArray(function (err, items) {
    console.log(arguments);
    res.json(items);
  })
})

module.exports = router;