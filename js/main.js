var bridgeIP = '192.168.1.64';
var bridgeKey = '2a3f4b3480ad1598426d7b5820a8604d';
var bridgeURL = 'http://' + bridgeIP + '/api/' + bridgeKey;
var bridgeData = {};
var knownData = {};

var dataClean = function(cleanObj, callback) {

	knownData[cleanObj] = true;

	console.log("");
	console.log('"' + cleanObj + '" is CLEAN!');
	console.log(knownData);
	console.log("");

	if(callback) {
		callback();
	}

}

var	dataDirty = function(dirtyObj, callback) {

	knownData[dirtyObj] = false;

	console.log("");
	console.log('"' + dirtyObj + '" is DIRTY!');
	console.log(knownData);
	console.log("");

	if(callback) {
		callback();
	}

}

var init = {

	bridge : function(callback) {

		var options = {
			url : bridgeURL,
			type : 'GET',
			dataType : 'json',
			async : false
		};

		if(callback) {
			options.success = callback;
		}

		console.log('Bridge data unknown, initializing.');

		return $.ajax(options).responseJSON;

	},

	light : function(lightData, i, callback) {

		var lightHTML = '';

		lightHTML += '<div id="light-' + i + '"" class="light">';
		lightHTML += '<div class="field number">';
		lightHTML += '<div class="display">';
		lightHTML += '<div class="label">Number: </div>';
		lightHTML += '<div class="value">' + i + '</div>';
		lightHTML += '</div>';
		lightHTML += '</div>';
		lightHTML += '<div class="field name">';
		lightHTML += '<div class="display">';
		lightHTML += '<div class="label">Name: </div>';
		lightHTML += '<div class="value">' + lightData.name + '</div>';
		lightHTML += '</div>';
		lightHTML += '</div>';
		lightHTML += '<div class="field power">';
		lightHTML += '<div class="display">';
		lightHTML += '<div class="label">Power: </div>';
		lightHTML += '<div class="value">' + light.onOrOff(lightData.state.on) + '</div>';
		lightHTML += '</div>';
		lightHTML += '<div class="adjust">'
		lightHTML += '<button class="on">On</button>';
		lightHTML += '<button class="off">Off</button>';
		lightHTML += '</div>';
		lightHTML += '</div>';
		lightHTML += '<div class="field bri">';
		lightHTML += '<div class="display">';
		lightHTML += '<div class="label">Brightness: </div>';
		lightHTML += '<div class="value">' + lightData.state.bri + '</div>';
		lightHTML += '</div>';
		lightHTML += '<div class="adjust">'
		lightHTML += '<button class="down">Down</button>';
		lightHTML += '<button class="up">Up</button>';
		lightHTML += '</div>';
		lightHTML += '</div>';
		lightHTML += '<div class="field hue">';
		lightHTML += '<div class="display">';
		lightHTML += '<div class="label">Hue: </div>';
		lightHTML += '<div class="value">' + light.getHueIncrement(lightData.state.hue) + ' / 20</div>';
		lightHTML += '</div>';
		lightHTML += '<div class="adjust">'
		lightHTML += '<button class="down">Down</button>';
		lightHTML += '<button class="up">Up</button>';
		lightHTML += '</div>';
		lightHTML += '</div>';
		lightHTML += '<div class="field sat">';
		lightHTML += '<div class="display">';
		lightHTML += '<div class="label">Saturation: </div>';
		lightHTML += '<div class="value">' + lightData.state.sat + '</div>';
		lightHTML += '</div>';
		lightHTML += '<div class="adjust">'
		lightHTML += '<button class="down">Down</button>';
		lightHTML += '<button class="up">Up</button>';
		lightHTML += '</div>';
		lightHTML += '</div>';
		lightHTML += '</div>';

		if(callback) {
			callback();
		}

		return lightHTML;

	},

	view : function(callback) {

		bridgeData = init.bridge(function(data) {
			console.log(data);
			dataClean('bridge');
		});

		for(i = 1; i <= Object.keys(bridgeData.lights).length; i++) {
			var lightHTML = init.light(bridgeData.lights[i], i);
			$('#lights').append(lightHTML);
			dataDirty('light' + i);
		}

		console.log('View initialization complete!');

		if(callback) {
			callback();
		}

	}
};

var bridge = {

	get : function(bridgeAPI, callback) {
	
		var options = {
			url : bridgeURL,
			type : 'GET',
			async : false
		};

		if(bridgeAPI) {
			options.url += bridgeAPI;
		}

		if(callback) {
			options.success = [function(){console.log("Callback invoked from bridge.GET")}, callback];
		}

		return $.ajax(options).responseJSON;

	},

	set : function(bridgeAPI, data, callback) {

		var options = {
			url : bridgeURL + bridgeAPI,
			type : "PUT",
			async : false,
			data : data
		};

		if(callback) {
			options.success = [function(){console.log("Callback invoked from bridge.SET")}, callback];
		}

		$.ajax(options);

	}
};

var light = {

	get : function(e, callback) {

		if(knownData['light' + lightIndex(e)] === true) {

			var lightData = bridgeData.lights[lightIndex(e)];
			console.log('Data should be clean, using known data!');
			return lightData;

		} else if(knownData['light' + lightIndex(e)] === false) {

			var lightAPI = '/lights/' + lightIndex(e);
			console.log('Data is dirty, querying bridge for: ' + lightAPI);
			var lightData = bridge.get(lightAPI, function(data) {
				console.log(data);
				dataClean('light' + lightIndex(e));
			});

			return lightData;

		} else {
			return;
		}

	},

	set : function(e, data, callback) {

		var lightAPI = '/lights/' + lightIndex(e) + '/state/';
		var data = JSON.stringify(data);

		bridge.set(lightAPI, data, function(data) {
			if(callback) {
				callback(data);
			}
		});

	},

	update : function(e, callback) {

		$(e.target).closest('.light').replaceWith(init.light(light.get(e), lightIndex(e)));
		if(callback) {
			callback();
		}

	},

	increase : function(e, field, value, max) {

		var oldData = light.get(e).state;
		var newData = {};

		var newValue = function() {
			if(oldData[field] + value <= max) {
				return oldData[field] + value;
			} else {
				return max;
			}
		};

		newData[field] = newValue();

		light.set(e, newData, function(data) {
			bridgeData.lights[lightIndex(e)].state[field] = newValue();
			light.update(e, function() {
				dataDirty('light' + lightIndex(e));
			});
		});

	},

	decrease : function(e, field, value) {

		var oldData = light.get(e).state;
		var newData = {};

		var newValue = function() {

			if(oldData[field] - value >= 0) {
				return oldData[field] - value;
			} else {
				return 0;
			}

		};

		newData[field] = newValue();

		light.set(e, newData, function(data) {
			bridgeData.lights[lightIndex(e)].state[field] = newValue();
			light.update(e, function() {
		
						dataDirty('light' + lightIndex(e));
			});
		});

	},

	onOrOff : function(value) {
	
		if(value === true) {
			return "On";
		} else {
			return "Off";
		}

	},

	getHueIncrement : function(value) {
	
		var highest = 65535;
		var step = 3449;

		return parseInt((value / step)+1);

	},

	power : function(e, value) {

		light.set(e, {on:value}, function(data) {
			bridgeData.lights[lightIndex(e)].state.on = value;
			light.update(e, function() {
				dataDirty('light' + lightIndex(e));
			});
		});

	}
};

var lightIndex = function(e) {

	return $(e.target).closest('.light').attr('id').split('-')[1]

};

$(function() {

	$('body').on('click', '.light .adjust .on', function(e) {
		light.power(e, true);
	});

	$('body').on('click', '.light .adjust .off', function(e) {
		light.power(e, false);
	});

	$('body').on('click', '.light .hue .adjust .up', function(e) {
		light.increase(e, 'hue', 3449, 65535);
	});

	$('body').on('click', '.light .hue .adjust .down', function(e) {
		light.decrease(e, 'hue', 3449);
	});

	$('body').on('click', '.light .bri .adjust .up', function(e) {
		light.increase(e, 'bri', 50, 255);
	});

	$('body').on('click', '.light .bri .adjust .down', function(e) {
		light.decrease(e, 'bri', 50);
	});

	$('body').on('click', '.light .sat .adjust .up', function(e) {
		light.increase(e, 'sat', 50, 255);
	});

	$('body').on('click', '.light .sat .adjust .down', function(e) {
		light.decrease(e, 'sat', 50);
	});

	init.view(function() {
		dataDirty('bridge');
	});

});