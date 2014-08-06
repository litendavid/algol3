if (typeof require === 'function' && typeof module === 'object') {
	var sinon = require('sinon'),
		jasmineSinon = require('jasmine-sinon'),
		Algol = require("../../algol.js"),
		_ = require("../../lodashmixins.js");
}
R = function(){ return parseInt(_.uniqueId(),10); };

describe("The time functions",function(){
	describe("The calcPropVal function",function(){
		var cpv = Algol.calcPropVal;
		describe("When called with undefined changes",function(){
			var startval = R(),
				result = cpv(startval);
			it("should return the startval",function(){ expect(result).toEqual(startval); });
		});
		describe("When called with empty changes array",function(){
			var startval = R(),
				result = cpv(startval,[]);
			it("should return the startval",function(){ expect(result).toEqual(startval); });
		});
		describe("When called with time prior to first change",function(){
			var startval = R(),
				time = R(),
				changetime = time+1,
				changeval = R(),
				changes = [[changetime,changeval]],
				result = cpv(startval,changes,time);
			it("should return the startval",function(){ expect(result).toEqual(startval); });
		});
		describe("When called with changes and undefined time",function(){
			var startval = R(),
				changetime = R(),
				changeval = R(),
				changes = [[changetime,changeval]],
				result = cpv(startval,changes,undefined);
			it("should return the last change val",function(){ expect(result).toEqual(changeval); });
		});
		describe("When called with changes and time after last change",function(){
			var startval = R(),
				changetime = R(),
				changeval = R(),
				time = changetime+1,
				changes = [[changetime,changeval]],
				result = cpv(startval,changes,time);
			it("should return the last change val",function(){ expect(result).toEqual(changeval); });
		});
		describe("When called with time prior to first change",function(){
			var startval = R(),
				time = R(),
				changetime = time+1,
				changeval = R(),
				changes = [[changetime,changeval]],
				result = cpv(startval,changes,time);
			it("should return the startval",function(){ expect(result).toEqual(startval); });
		});
		describe("When called with time between changes",function(){
			var startval = R(),
				firstchangetime = R(),
				firstchangeval = R(),
				secondchangetime = firstchangetime+R(),
				secondchangeval = R(),
				time = secondchangetime+R(),
				thirdchangetime = time+R(),
				thirdchangeval = R(),
				changes = [[firstchangetime,firstchangeval],[secondchangetime,secondchangeval],[thirdchangetime,thirdchangeval]],
				result = cpv(startval,changes,time);
			it("should return closest change prior to time",function(){ expect(result).toEqual(secondchangeval); });
		});
	});
});