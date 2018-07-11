function login(_username,_password){
	$.post( "api/users/webLogin", { username: _username, password: _password }, function( data ) {
		if(data.status="success"){
			document.location= "/";
		}
	});
}

function logout(){
	$.post( "api/users/webLogout", function( data ) {
		if(data.status="success"){
			document.location = "/";
		}
	});
}