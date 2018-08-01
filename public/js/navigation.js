function navigate(_container,_route){
	$.get(_route, function( data ) {
		$("#"+_container).html(data);
	});
}