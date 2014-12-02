function Pwd() {
	that = this;
}

//<script>
//    var encrypted = CryptoJS.TripleDES.encrypt("Message", "Secret Passphrase");
//    var decrypted = CryptoJS.TripleDES.decrypt(encrypted, "Secret Passphrase");
//</script>

var scrtPasPhrase = "4NemosNautilus";

Pwd.prototype.setup = function(callback) {

	//First, setup the database
	this.db = window.openDatabase("Pwd", 1, "Pwd", 1000000);
	this.db.transaction(this.initDB, this.dbErrorHandler, callback);

}



//Genric database error handler. Won't do anything for now.
Pwd.prototype.dbErrorHandler = function(e) {
	console.log('DB Error');
	console.dir(e);
}

//I initialize the database structure
Pwd.prototype.initDB = function(t) {
	t.executeSql('create table if not exists pwd(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, user TEXT,body TEXT, image TEXT, published DATE)');
	
}

Pwd.prototype.getEntries = function(start,callback) {
	console.log('Running getEntries');
	if(arguments.length === 1) callback = arguments[0];

	this.db.transaction(
		function(t) {
			t.executeSql('select id, title, user, body, image, published from pwd order by published desc',[],
				function(t,results) {
					callback(that.fixResults(results));
				},this.dbErrorHandler);
		}, this.dbErrorHandler);

}

Pwd.prototype.getEntry = function(id, callback) {

	this.db.transaction(
		function(t) {
			t.executeSql('select id, title, user, body, image, published from pwd where id = ?', [id],
				function(t, results) {
					callback(that.fixResult(results));
				}, this.dbErrorHandler);
			}, this.dbErrorHandler);

}

//No support for edits yet
Pwd.prototype.saveEntry = function(data, callback) {

var encpTitle = CryptoJS.TripleDES.encrypt(data.title, scrtPasPhrase);
var encpUser = CryptoJS.TripleDES.encrypt(data.user, scrtPasPhrase);
var encpBody = CryptoJS.TripleDES.encrypt(data.body, scrtPasPhrase);
console.dir(data);
	this.db.transaction(
		function(t) {
			t.executeSql('insert into pwd(title,user,body,image,published) values(?,?,?,?,?)', [encpTitle, encpUser, encpBody, data.image, new Date()],
			function() { 
				callback();
			}, this.dbErrorHandler);
		}, this.dbErrorHandler);
}

//Delete entry
Pwd.prototype.deleteEntry = function(id, callback) {
	this.db.transaction(
		function(t) {
			t.executeSql('delete * from pwd where id=?', [id],
			function() { 
				callback();
			}, this.dbErrorHandler);
		}, this.dbErrorHandler);
}

//Utility to convert record sets into array of obs
Pwd.prototype.fixResults = function(res) {
	var result = [];
	for(var i=0, len=res.rows.length; i<len; i++) {
		var row = res.rows.item(i);
		result.push(row);
	}
	return result;
}

//I'm a lot like fixResults, but I'm only used in the context of expecting one row, so I return an ob, not an array
Pwd.prototype.fixResult = function(res) {
	if(res.rows.length) {
		return res.rows.item(0);
	} else return {};
}