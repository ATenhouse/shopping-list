var express = require('express')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var Storage = require('./storage')

var storage = new Storage()
storage.add('Broad beans')
storage.add('Tomatoes')
storage.add('Peppers')

var app = express()
app.use(express.static('public'))

app.get('/items', function(req, res) {
    res.json(storage.items)
})

function isEmpty(obj){
    return (Object.getOwnPropertyNames(obj).length === 0);
}

// Straight-up yanked from http://stackoverflow.com/a/20392392
function tryParseJSON(jsonString){
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return true;
        }
    }
    catch (e) { }

    return false;
};

app.post('/items', jsonParser, function(req, res) {
    if (!req.body || (isEmpty(req.body))) {
        res.status(400).json({
            "error": "Your request appears invalid. Please pass valid JSON in the form of {name: item}."
        })
    }
    else if (req.body.id) {
        if (storage.id > req.body.id){
            res.status(400).json({
                "error": "The ID you've specified already exists. POSTing is intended for new entries, not replacing one. Please try REPLACE instead."
            })
        }
        else {
            var item = storage.add(req.body.name)
            res.status(201).json(item)
        }
    } else {
        var item = storage.add(req.body.name)
        res.status(201).json(item)
    }
})

app.delete('/items/:id', jsonParser, function(req, res) {
    // Need to force the string 'id' to a Number for proper use in an Array reference
    var inner_id = Number(req.params.id)
    if(req.params.id === undefined){
        return res.status(400).json({
            "error": "DELETE endpoint requires an ID, i.e. /items/ID."
        })
    }
    if (isNaN(inner_id)) {
        return res.status(400).json({
            "error": "Requested ID '" + req.params.id + "' is not a number."
        })
    }
    var deleted_items = storage.delete(inner_id)
    if (deleted_items.length > 0) {
        res.status(200).json({
            status: "Successfully deleted some items.",
            items: deleted_items
        })
    } else {
        res.status(400).json({
            "error": "The ID you requested to delete ("+inner_id+") did not exist in the list."
        })
    }
})

app.put('/items/:id?', jsonParser, function(req, res) {
    // Need to force the string 'id' to a Number for proper use in an Array reference
    var passed_obj = req.body
    var passed_id = req.params.id || storage.id
    var inner_id = Number(passed_id)
    if (isNaN(inner_id)) {
        return res.status(400).json({
            "error": "Requested ID '" + req.params.id + "' is not a number."
        })
    }
    if (req.params.id && req.body.id && (req.params.id !== req.body.id)) {
        return res.status(400).json({
            "error": "Requested endpoint id "+req.params.id+" does not match the ID defined in the object: "+req.body.id
        })
    }
    if(isEmpty(passed_obj) || tryParseJSON(passed_obj)){
        return res.status(400).json({
            "error": "Request refused. To replace a valid item, we need body data. Please attempt again in the form of {name: STRING, id: NUMBER}"
        })
    }
    var replaced = storage.replace(inner_id, passed_obj)
    if (replaced.length > 0) {
        res.status(200).json({
            status: "Successfully replaced " + replaced.length + " item(s).",
            replaced: replaced
        })
    } else {
        storage.add(passed_obj.name)
        res.status(200).json({
            status: inner_id + " did not appear as a valid ID in original list; appended to the shopping list.",
            added: passed_obj
        })
    }
})



app.listen(process.env.PORT || 3000)

module.exports = {
    storage: storage,
    app: app
}