var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var Storage = function() {
    this.items = [];
    this.id = 0;
};

Storage.prototype.add = function(name) {
    var item = {
        name: name,
        id: this.id
    };
    this.items.push(item);
    this.id += 1;
    return item;
};

Storage.prototype.delete = function(target_id) {
    var deleted = [];
    this.items = this.items.filter(function(obj) {
        if (obj.id !== target_id) {
            return true;
        } else {
            deleted.push(obj);
            return false;
        }
    });
    return deleted;
};

var storage = new Storage();
storage.add('Broad beans');
storage.add('Tomatoes');
storage.add('Peppers');

var app = express();
app.use(express.static('public'));

app.get('/items', function(req, res) {
    res.json(storage.items);
});

app.post('/items', jsonParser, function(req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }
    var item = storage.add(req.body.id);
    res.status(201).json(item);
});

app.delete('/items/:id', jsonParser, function(req, res) {
    // Need to force the string 'id' to a Number for proper use in an Array reference
    var inner_id = Number(req.params.id);
    if (isNaN(inner_id)) {
        return res.status(400).json({
            "error": "Requested ID '"+req.params.id+"' is not a number."
        });
    }
    var deleted_items = storage.delete(inner_id);
    if (deleted_items !== null) {
        res.status(200).json({
            status: "Successfully deleted some items.",
            items: deleted_items
        });
    } else {
        res.status(200).json({
            status: "No items were deleted from the shopping list. Chances are this ID has already been deleted."
        });
    }
});

app.listen(process.env.PORT || 8080);