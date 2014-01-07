require.config({
	baseUrl: 'js/lib',
	paths: {
		app : '../app'
	}
});

require(['jquery', 'app/light', 'app/bridge'], function(){

	var $ =			require('jquery'),
		Bridge =	require('app/bridge'),
		Light =		require('app/light');

	var bridge =	new Bridge({
							ip : '192.168.1.64',
							apiKey : '2a3f4b3480ad1598426d7b5820a8604d'
						});

	$(function(){

		bridge.query({

			callback : function(item, data){

				$.each(data.lights, function(key, val){
					
					var light = new Light({
										bridge : bridge,
										number : key
									});

					light.generate(val);
					bridge.lights.push(light);

					$('#lights').append(light.build().$html);

				});

				console.log(bridge.lights);

			}
		});
	});
});