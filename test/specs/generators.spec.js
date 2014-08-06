if (typeof require === 'function' && typeof module === 'object') {
	var sinon = require('sinon'),
		jasmineSinon = require('jasmine-sinon'),
		Algol = require("../../algol.js"),
		_ = require("../../lodashmixins.js");
}
R = function(){ return parseInt(_.uniqueId(),10); };
RS = function(howmany){ return _.map(_.range(0,howmany),function(){return R();}); };
SERIES = function(arr){ var i = 0; return function(){ return arr[i++];}; };

describe("the generator functions",function(){
	describe("the offsetindirs function",function(){
		it("is defined",function(){ expect(typeof Algol.offsetInDirs).toEqual("function"); });
		describe("when called",function(){
			var dirs = RS(2),
				startpos = R(),
				newpos = R(),
				movedpos = RS(2),
				ykx = R(),
				board = R(),
				context = {
					moveInDir: sinon.spy(SERIES(movedpos)),
					outOfBounds: sinon.spy(SERIES([true])), // first call will be true, following calls undef
					posToYkx: sinon.stub().returns(ykx)
				},
				def = R(),
				result = Algol.offsetInDirs.call(context,def,startpos,dirs,board);
			it("used moveInDir on all dirs",function(){
				expect(context.moveInDir).toHaveBeenCalledTwice();
				expect(context.moveInDir.firstCall.args).toEqual([startpos,dirs[0],def,board]);
				expect(context.moveInDir.secondCall.args).toEqual([startpos,dirs[1],def,board]);
			});
			it("used outOfBounds to check moved positions",function(){
				expect(context.outOfBounds).toHaveBeenCalledTwice();
				expect(context.outOfBounds.firstCall.args).toEqual([movedpos[0],board]);
				expect(context.outOfBounds.secondCall.args).toEqual([movedpos[1],board]);
			});
			it("used posToYkx on the non-outofbounds position",function(){
				expect(context.posToYkx).toHaveBeenCalledOnce();
				expect(context.posToYkx.firstCall.args).toEqual([movedpos[1]]);
			});
			describe("the returned object",function(){
				it("uses postoykx results for non-outofbounds positions as key",function(){
					expect(_.keys(result).length).toBe(1);
					expect(result.hasOwnProperty(ykx)).toBe(true);
				});
				it("stored an object for each position with a DIR prop containing the direction",function(){
					expect(result[ykx]).toEqual({DIR:dirs[1]});
				});
			});
		});
		it("passes integration test",function(){
			var dirs = [1,3],
				def = { forward: 2, right: 1 },
				startpos = { x:1,y:1 },
				board = {x:5,y:5},
				res = Algol.offsetInDirs(def,startpos,dirs,board);
			expect(res).toEqual({2003:{DIR:3}});
		});
	});
	describe("the walk functions",function(){
		describe("the walkInDir function",function(){
			it("is defined",function(){ expect(typeof Algol.walkInDir).toEqual("function"); });
			describe("when walking and drawing step and stop",function(){
				var dir = R(),
					stopreason = R(),
					stops = R(),
					steps = R(),
					board = R(),
					startpos = {m:0},
					moves = [{m:1},{m:2},{m:3},{m:4}],
					ykx = RS(4),
					context = {
						walkCheck: sinon.spy(SERIES([undefined,undefined,undefined,stopreason])), // fourth will fail
						moveInDir: sinon.spy(SERIES(moves)),
						posToYkx: sinon.spy(SERIES(ykx))
					},
					def = {
						drawatstep: true,
						drawatstop: true,
						max: R()
					},
					res = Algol.walkInDir.call(context,def,startpos,dir,stops,steps,board),
					keys = _.keys(res);
				it("returns an object for all steps and one for the stop",function(){
					expect(keys.length).toEqual(4);
					_.each(["walkstep","walkstep","walkstep","walkstop"],function(kind,i){
						expect(res[keys[i]].WALKKIND).toEqual(kind);
					});
				});
				it("marks all objects with dir, distance, length and stopreason",function(){
					_.each(_.range(0,4),function(i){
						expect(res[keys[i]].WALKDISTANCE).toEqual(i+1);
						expect(res[keys[i]].WALKLENGTH).toEqual(4);
						expect(res[keys[i]].WALKSTOPREASON).toEqual(stopreason);
						expect(res[keys[i]].DIR).toEqual(dir);
					});
				});
				it("uses walkCheck for each step",function(){
					expect(context.walkCheck.callCount).toEqual(4);
					expect(context.walkCheck.firstCall.args).toEqual([moves[0],1,def.max,stops,steps,board]);
					expect(context.walkCheck.secondCall.args).toEqual([moves[1],2,def.max,stops,steps,board]);
					expect(context.walkCheck.thirdCall.args).toEqual([moves[2],3,def.max,stops,steps,board]);
					expect(context.walkCheck.lastCall.args).toEqual([moves[3],4,def.max,stops,steps,board]);
				});
				it("used movedInDir for each step",function(){
					expect(context.moveInDir.callCount).toEqual(4);
					expect(context.moveInDir.firstCall.args).toEqual([startpos,dir,{forward:1},board]);
					expect(context.moveInDir.secondCall.args).toEqual([moves[0],dir,{forward:1},board]);
					expect(context.moveInDir.thirdCall.args).toEqual([moves[1],dir,{forward:1},board]);
					expect(context.moveInDir.lastCall.args).toEqual([moves[2],dir,{forward:1},board]);
				});
				it("used posToYkx to determine keys",function(){
					expect(context.posToYkx.callCount).toEqual(4);
					expect(context.posToYkx.firstCall.args[0].m).toEqual(moves[0].m);
					expect(context.posToYkx.secondCall.args[0].m).toEqual(moves[1].m);
					expect(context.posToYkx.thirdCall.args[0].m).toEqual(moves[2].m);
					expect(context.posToYkx.lastCall.args[0].m).toEqual(moves[3].m);
				});
			});
			describe("when walking and drawing all but stopping due to outofbounds",function(){
				var context = {
						walkCheck: sinon.spy(SERIES([undefined,undefined,undefined,"outofbounds"])), // fourth will fail
						moveInDir: _.identity,
						posToYkx: R
					},
					def = {
						drawatstep: true,
						drawatstop: true
					},
					res = Algol.walkInDir.call(context,def),
					keys = _.keys(res);
				it("doesn't include the stop square",function(){
					expect(keys.length).toEqual(3);
					_.each(keys,function(key){
						expect(res[key].WALKKIND).toEqual("walkstep");
					});
				});
			});
			describe("when only drawing stop",function(){
				var context = {
						walkCheck: sinon.spy(SERIES([undefined,undefined,undefined,R()])), // fourth will fail
						moveInDir: _.identity, // sinon.spy(function(p){return {p:p.p+"x"};}),
						posToYkx: R //sinon.spy(function(p){ return "Y"+p.p;})},
					},
					def = {
						drawatstep: false,
						drawatstop: true
					},
					res = Algol.walkInDir.call(context,def), //,startpos,dir,stops,steps,board),
					keys = _.keys(res);
				it("doesn't include step squares",function(){
					expect(keys.length).toEqual(1);
					expect(res[keys[0]].WALKKIND).toEqual("walkstop");
				});
			});
			describe("when only drawing steps",function(){
				var context = {
						walkCheck: sinon.spy(SERIES([undefined,undefined,undefined,R()])), // fourth will fail will random reason
						moveInDir: _.identity,
						posToYkx: R
					},
					def = {
						drawatstep: true,
						drawatstop: false
					},
					res = Algol.walkInDir.call(context,def),
					keys = _.keys(res);
				it("doesn't include the stop square",function(){
					expect(keys.length).toEqual(3);
					_.each(keys,function(key){
						expect(res[key].WALKKIND).toEqual("walkstep");
					});
				});
			});
		});
		describe("the walkcheck function",function(){
			it("is defined",function(){ expect(typeof Algol.walkCheck).toEqual("function"); });
			describe("when all is in order",function(){
				var context = {outOfBounds: sinon.stub().returns(false), posToYkx: sinon.stub().returns("someykx") },
					steps = {someykx:"bar"},
					stops = {},
					res = Algol.walkCheck.call(context,undefined,2,3,stops,steps);
				it("returns undefined",function(){
					expect(res).toBeUndefined();
				});
			});
			describe("when step is missing",function(){
				var context = {outOfBounds: sinon.stub().returns(false), posToYkx: sinon.stub().returns("someykx") },
					steps = {},
					stops = {},
					res = Algol.walkCheck.call(context,undefined,2,3,stops,steps);
				it("returns nostep",function(){
					expect(res).toEqual("nostep");
				});
			});
			describe("when hit stop",function(){
				var context = {outOfBounds: sinon.stub().returns(false), posToYkx: sinon.stub().returns("someykx") },
					stops = {someykx:"bin"},
					res = Algol.walkCheck.call(context,undefined,2,3,stops);
				it("returns hitstop",function(){
					expect(res).toEqual("hitstop");
				});
			});
			describe("when step is missing AND hit stop",function(){
				var context = {outOfBounds: sinon.stub().returns(false), posToYkx: sinon.stub().returns("someykx") },
					stops = {someykx:"bin"},
					steps = {},
					res = Algol.walkCheck.call(context,undefined,2,3,stops,steps);
				it("returns hitstop as that takes precedence",function(){
					expect(res).toEqual("hitstop");
				});
			});
			describe("when walked too far",function(){
				var context = { outOfBounds: sinon.spy(), posToYkx: sinon.spy() },
					res = Algol.walkCheck.call(context,undefined,3,2);
				it("returns exceededmax",function(){
					expect(res).toEqual("exceededmax");
				});
				it("didn't need to use any other function",function(){
					expect(context.outOfBounds).not.toHaveBeenCalled();
					expect(context.posToYkx).not.toHaveBeenCalled();
				});
			});
			describe("when hit stop AND walked too far",function(){
				var context = {outOfBounds: sinon.stub().returns(false), posToYkx: sinon.stub().returns("someykx") },
					stops = {someykx:"bin"},
					res = Algol.walkCheck.call(context,undefined,3,2,stops);
				it("returns exceededmax as that takes precedence",function(){
					expect(res).toEqual("exceededmax");
				});
			});
			describe("when out of bounds",function(){
				var context = { outOfBounds: sinon.stub().returns(true), posToYkx: sinon.spy() },
					pos = R(),
					board = R(),
					res = Algol.walkCheck.call(context,pos,0,0,undefined,undefined,board);
				it("returns outofbounds",function(){
					expect(res).toEqual("outofbounds");
				});
				it("didn't need to use posToYkx",function(){
					expect(context.posToYkx).not.toHaveBeenCalled();
				});
				it("used outOfBounds",function(){
					expect(context.outOfBounds).toHaveBeenCalledOnce();
					expect(context.outOfBounds.firstCall.args).toEqual([pos,board]);
				});
			});
			describe("when out of bounds AND exceeded max",function(){
				var context = {outOfBounds: sinon.stub().returns(true), posToYkx: sinon.stub().returns("someykx") },
					res = Algol.walkCheck.call(context,undefined,3,2);
				it("returns exceededmax as that takes precedence",function(){
					expect(res).toEqual("exceededmax");
				});
			});
		});
	});
});