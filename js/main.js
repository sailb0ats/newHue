var bridgeIP = '192.168.1.64'
var bridgeKey = '2a3f4b3480ad1598426d7b5820a8604d'
var bridgeURL = 'http://' + bridgeIP + '/api/' + bridgeKey 
var bridgeData = {};

var init = {

	bridge : function(){

		var options = {
			url : bridgeURL,
			type : 'GET',
			dataType : 'json',
			async : false
		}

		return $.ajax(options).responseJSON;

	},

	light : function(lightData, i){

		var lightHTML = ''

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
		lightHTML += '<div class="label">On: </div>';
		lightHTML += '<div class="value">' + lightData.state.on + '</div>';
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
		lightHTML += '<div class="value">' + lightData.state.hue + '</div>';
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

		return lightHTML;

	},

	view : function(){

		bridgeData = init.bridge();

		for(i = 1; i <= Object.keys(bridgeData.lights).length; i++){

			var lightHTML = init.light(bridgeData.lights[i], i);
			$('#lights').append(lightHTML);

		}
	}
};


var bridge = {

	get : function(bridgeAPI, callback){
		
			var options = {
				url : bridgeURL,
				type : 'GET',
				async : false
			};

			if (bridgeAPI) {
				options.url += bridgeAPI;
			};

			if (callback) {
				options.success = callback
			};

			return $.ajax(options).responseJSON;

		},

	set : function(bridgeAPI, data, callback){

		var options = {
			type : "PUT",
			url : bridgeURL + bridgeAPI,
			async : false,
			data : data
		};

		if (callback) {
			options.success = callback;
		};

		$.ajax(options);
	}
};



var light = {

	get : function(e){

		var lightAPI = '/lights/' + lightIndex(e);
		var lightData = bridge.get(lightAPI);

		return lightData;

	},

	set : function(e, data){

		var lightAPI = '/lights/' + lightIndex(e) + '/state/';
		var data = JSON.stringify(data);

		bridge.set(lightAPI, data, function(){
			light.update(e);
		});
		
	},

	update : function(e){

		$(e.target).closest('.light').replaceWith(init.light(light.get(e), lightIndex(e)))

	},

	increase : function(e, field, value, max){

		var oldData = light.get(e).state;
		var newData = {};

		var newValue = function(){
			if ( oldData[field] + value <= max) {
				return oldData[field] + value
			} else {
				return max
			}
		};

		Object.defineProperty(newData, field, {
			value : newValue(),
			writable : true,
			enumerable : true,
			configurable : true
		});

		light.set(e, newData);

	},

	decrease : function(e, field, value){

		var oldData = light.get(e).state;
		var newData = {};

		var newValue = function(){
			if ( oldData[field] - value >= 0) {
				return oldData[field] - value
			} else {
				return 0
			}
		};

		Object.defineProperty(newData, field, {
			value : newValue(),
			writable : true,
			enumerable : true,
			configurable : true
		});

		light.set(e, newData);

	}

}

var lightIndex = function(e){
	return $(e.target).closest('.light').attr('id').split('-')[1]	
}

$(function(){

	$('body').on('click', '.light .adjust .on', function(e){
		light.set(e, {on:true});
	})

	$('body').on('click', '.light .adjust .off', function(e){
		light.set(e, {on:false});
	})

	$('body').on('click', '.light .hue .adjust .up', function(e){
		light.increase(e, 'hue', 8192, 65535);
	})

	$('body').on('click', '.light .hue .adjust .down', function(e){
		light.decrease(e, 'hue', 8192);
	})

	$('body').on('click', '.light .bri .adjust .up', function(e){
		light.increase(e, 'bri', 50, 255);
	})

	$('body').on('click', '.light .bri .adjust .down', function(e){
		light.decrease(e, 'bri', 50);
	})

	$('body').on('click', '.light .sat .adjust .up', function(e){
		light.increase(e, 'sat', 50, 255);
	})

	$('body').on('click', '.light .sat .adjust .down', function(e){
		light.decrease(e, 'sat', 50);
	})

	init.view();

})