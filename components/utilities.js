bcrypt = require('bcryptjs')

module.exports.encryptString = function(password, salt){ 
        //salt = bcrypt.genSaltSync();
        return bcrypt.hashSync(password, salt);
}

module.exports.compareEncryptedString = function(password, encryptedPasswordToCompareTo){
	    if(bcrypt.compareSync(password, encryptedPasswordToCompareTo)) {
			// Passwords match
			return true;
		} else {
			// Passwords don't match
			return false;
		}
}