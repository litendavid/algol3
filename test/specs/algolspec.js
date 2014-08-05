
var Algol = (typeof require !== undefined ? require("../../algol.js") : window.Algol),
	_ = (typeof require !== undefined ? require("lodash") : window._),
	R = _.uniqueId;

describe("The time functions",function(){
	describe("The calcPropVal function",function(){
		var cpv = Algol.calcPropVal;
		describe("When called with undefined changes",function(){
			var startval = R(), result = cpv(startval);
			it("should return the startval",function(){
				expect(result).toEqual(startval);
			});
		});
	});
});