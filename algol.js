(function(){

var Algol = {};

/**
	 * Calculates property state at a given time according to startvalue and changes
	 * @param {Number|String} startvalue
	 * @param {Array} changes List of changes, each change is [step,value]
	 * @param {Number} step
	 * @return {Number|String} Value at given time
 */
Algol.calcPropVal = function(startvalue,changes,step){
	if (!changes || !changes.length ){ return startvalue; } // no change, return startval
	if ((!step) || step > changes[changes.length-1][0]){ return changes[changes.length-1][1]; } // no time given or time after last change, return last change value
	if (step < changes[0][0]){ return startvalue; } // time prior to first change, return start val
	return _.find(changes.slice().reverse(),function(change){ return change[0] <= step; })[1]; // last change val before step
};


// €€€€€€€€€€€€€ EXPORTS

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Algol;
  else
    window.Algol = Algol;
})();