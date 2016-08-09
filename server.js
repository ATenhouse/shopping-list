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

app.post('/items', jsonParser, function(req, res) {
    if (!req.body) {
        return res.sendStatus(400)
    }
    var item = storage.add(req.body.name)
    res.status(201).json(item)
})

app.delete('/items/:id', jsonParser, function(req, res) {
    // Need to force the string 'id' to a Number for proper use in an Array reference
    var inner_id = Number(req.params.id)
    if (isNaN(inner_id)) {
        return res.status(400).json({
            "error": "Requested ID '"+req.params.id+"' is not a number."
        })
    }
    var deleted_items = storage.delete(inner_id)
    if (deleted_items !== null) {
        res.status(200).json({
            status: "Successfully deleted some items.",
            items: deleted_items
        })
    } else {
        res.status(200).json({
            status: "No items were deleted from the shopping list. Chances are this ID has already been deleted."
        })
    }
})

app.put('/items/:id', jsonParser, function(req, res) {
    // Need to force the string 'id' to a Number for proper use in an Array reference
    var passed_obj = req.body
    var inner_id = Number(req.params.id)
    if (isNaN(inner_id)) {
        return res.status(400).json({
            "error": "Requested ID '"+req.params.id+"' is not a number."
        })
    }
    var replaced = storage.replace(inner_id, passed_obj)
    if (replaced.length > 0) {
        res.status(200).json({
            status: "Successfully replaced "+replaced.length+" item(s).",
            replaced: replaced
        })
    } else {
    	storage.add(passed_obj)
        res.status(200).json({
            status: inner_id+" did not appear as a valid ID in original list appended to the shopping list.",
            added: passed_obj
        })
    }
})

app.listen(process.env.PORT || 3000)

module.exports = {
    storage: storage,
    app: app
}