var Storage = function() {
    this.items = []
    this.id = 0
}

Storage.prototype.add = function(name) {
    var item = {
        name: name,
        id: this.id
    }
    this.items.push(item)
    this.id += 1
    return item
}

Storage.prototype.delete = function(target_id) {
    var deleted = []
    this.items = this.items.filter(function(obj) {
        if (obj.id !== target_id) {
            return true
        } else {
            deleted.push(obj)
            return false
        }
    })
    return deleted
}

Storage.prototype.replace = function(target_id, replacement_obj) {
    var replaced = []
    this.items = this.items.map(function(obj) {
        if (obj.id === target_id) {
        	replaced.push(obj)
            obj === replacement_obj
        }
    })
    return replaced
}

module.exports = Storage