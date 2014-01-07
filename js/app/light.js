define(function() {

var Light = function(params){

	var number = params.number;

	this.params = params;

	this.props = {
		number : number,
		getAPI : '/lights/' + number,
		setAPI : '/lights/' + number + '/state',
		renameAPI : '/lights/' + number,
		index : number - 1,
		state : {},
		newData : { state : { xy : {} } },
	};

	return this;

};

Light.prototype = {

	generate : function(data){

		var that = this;
		$.each(data, function(key, val){
			that[key] = val;
		});



	},

	build : function(){

		var $html = $('<div>', { class : 'light', id : 'light-' + (this.props.number) }),
			
			$name = $('<div>', { class : 'name', text : 'Name: ' + this.name }),
			
			$values = $('<div>', { class : 'values' })
				.append($('<div>', { class : 'field' })
					.append($('<div>', { class : 'label', text : 'Power: ' }))
					.append($('<div>', { class : 'value', text : this.state.on }))
				)
				.append($('<div>', { class : 'field' })
					.append($('<div>', { class : 'label', text : 'Hue: ' }))
					.append($('<div>', { class : 'value', text : this.state.hue }))
				)
				.append($('<div>', { class : 'field' })
					.append($('<div>', { class : 'label', text : 'Brightness: ' }))
					.append($('<div>', { class : 'value', text : this.state.bri }))
				)
				.append($('<div>', { class : 'field' })
					.append($('<div>', { class : 'label', text : 'Saturation: ' }))
					.append($('<div>', { class : 'value', text : this.state.sat }))
				);

		$html.append($name).append($values)

		return {

			$html : $html,
			
			render : function(container){

				var $container;

				if(typeof container === 'string') {
					$container = $(container);
				} else {
					$container = container;
				}

				$container.html('');
				$container.append($html);

			}
		}
	}
};

	return Light

});