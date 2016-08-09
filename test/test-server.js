describe('Shopping List', function() {
    it('should list items on get');
    it('should add an item on post');
    it('should edit an item on put');
    it('should delete an item on delete');
	it("should throw an error on POST to an ID that exists");
	it("should throw an error on a POST without body data");
	it("should throw an error on POST with something other than valid JSON");
	it("should automatically handle a PUT without an ID in the endpoint");
	it("should handle a PUT with different ID in the endpoint than the body");
	it("should automatically PUT to an ID that doesn't exist");
	it("should bounce, and throw an error for, a PUT without body data");
	it("throw an error for a PUT with something other than valid JSON");
	it("throw an error for a DELETE an ID that doesn't exist");
	it("handle a DELETE without an ID in the endpoint");
});