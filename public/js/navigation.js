function navigate(_container,_route){
	console.log(_container);
	console.log(_route);
	$.get(_route, function( data ) {
		$("#"+_container).html(data);
	});
}