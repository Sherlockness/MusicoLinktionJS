function login(_username,_password){
	$.post( "/users/login", { username: _username, password: _password }, function( data ) {
		if(data.status="success"){
			document.location= "/";
		}
	});
}

function logout(){
	$.post( "/users/logout", function( data ) {
		if(data.status="success"){
			document.location = "/";
		}
	});
}