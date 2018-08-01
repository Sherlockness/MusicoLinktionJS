function openServiceGrant(serviceURL,data){
	alert("test");
	var url = serviceURL;
	var cptData = 0;
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			if(cptData > 0){
				url += '&'+key+'='+data[key];
			}else{
				url += key+'='+data[key];
			}
		}
	}
	window.open(url,'_blank');
}