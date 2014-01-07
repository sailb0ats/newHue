define(function() {

	var Bridge = function(params){

		this.params = params;
		this.baseURL = 'http://' + params.ip + '/api/' + params.apiKey;
		this.lights = [];

		return this;

	};

	Bridge.prototype = {

		query : function(params){

			var options = {
				type : 'GET',
				url : this.baseURL,
				dataType : 'json'
			};

			if(typeof params.item === 'object' && typeof params.item.number === 'number'){
				item = params.item;
			} else {
				item = this;
			}

			if(typeof item.getAPI === 'string'){
				options.url += item.getAPI;
			}

			if(typeof params.callback === 'function'){
				options.success = function(data){
					params.callback(item, data);
				}
			}

			$.ajax(options);

		}

	}

	return Bridge;

});