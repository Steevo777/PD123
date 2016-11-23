var pwd;
var mainView;
var globalRecordID;

document.addEventListener('deviceready', deviceready, false);

function deviceready() {
	console.log('deviceready');

	//create a new instance of our Pwd and listen for it to complete it's setup
	pwd = new Pwd();
	pwd.setup(startApp);
}

/*
Main application handler. At this point my database is setup and I can start listening for events.
*/

function startApp() {
	console.log('startApp');

	mainView = $("#mainView");

	//Load the main view
	pageLoad("main.html");
	
	//Always listen for home click
	$(document).on("touchend", ".homeButton", function(e) {
		e.preventDefault();
		pageLoad("main.html");
	});
}

function pageLoad(u) {
	console.log("load "+u);
	//convert url params into an ob
	var data = {};
	if(u.indexOf("?") >= 0) {
		var qs = u.split("?")[1];
		var parts = qs.split("&");
		for(var i=0, len=parts.length; i<len; i++) {
			var bits = parts[i].split("=");
			data[bits[0]] = bits[1];
		};
	}

$.get(u,function(res,code) {
		mainView.html(res);
		var evt = document.createEvent('CustomEvent');
		evt.initCustomEvent("pageload",true,true,data);
		var page = $("div", mainView);
		page[0].dispatchEvent(evt);
	});
}

$(document).on("pageload", "#mainPage", function(e) {
	pwd.getEntries(function(data) {
		console.log('getEntries');
		var s = "";
		
		$("#entryList").html("Decrpyting Information...");
		
		data.sort(function(a, b){
			 var titleAu=CryptoJS.TripleDES.decrypt(a.title, scrtPasPhrase), titleBu=CryptoJS.TripleDES.decrypt(b.title, scrtPasPhrase);
			 var titleA = titleAu.toString(CryptoJS.enc.Latin1).toLowerCase(),titleB = titleBu.toString(CryptoJS.enc.Latin1).toLowerCase();
			 if (titleA < titleB) //sort string ascending
			  return -1; 
			 if (titleA > titleB)
			  return 1;
			 return 0; //default return value (no sorting)
			});

		s= "<div class='list-group'>";
		for(var i=0, len=data.length; i<len; i++) {
			var encrptTitle = CryptoJS.TripleDES.decrypt(data[i].title, scrtPasPhrase);
			encrptTitle = encrptTitle.toString(CryptoJS.enc.Latin1);
			s += "<div data-id='"+data[i].id+"' class='list-group-item'> " + encrptTitle + "  </div>";
		}
		
		s += "</div>";
		$("#entryList").html(s);

		//Listen for add clicks
		$("#addEntryBtn").on("touchstart", function(e) {
			e.preventDefault();
			pageLoad("add.html");
		});
		
		//Listen for add clicks
		$("#settingsBtn").on("touchstart", function(e) {
			$("#entryList").html("Starting Send Information...");
			e.preventDefault();
			
			sendEntries(e);
		});

		//Listen for entry clicks
		$("#entryList div").on("touchstart", function(e) { 
			e.preventDefault();
			console.log("entry click");
			var id = $(this).data("id");
			pageLoad("entry.html?id="+id);
		});

	});

});

function sendEntries(e) {
	
}



$(document).on("pageload", "#entryPage", function(e) {

	$("#entryDisplay").html("Decrytping Information...");
	var recordID = Number(e.detail.id);
	globalRecordID = Number(e.detail.id);
	pwd.getEntry(Number(e.detail.id), function(ob) {
		var encrptTitle = CryptoJS.TripleDES.decrypt(ob.title, scrtPasPhrase);
		encrptTitle = encrptTitle.toString(CryptoJS.enc.Latin1);
		var encrptUser = CryptoJS.TripleDES.decrypt(ob.user, scrtPasPhrase);
		encrptUser = encrptUser.toString(CryptoJS.enc.Latin1);
		var encrptBody = CryptoJS.TripleDES.decrypt(ob.body, scrtPasPhrase);
		encrptBody = encrptBody.toString(CryptoJS.enc.Latin1);
		var content = "<h2>" + encrptTitle + "</h2>";
		content += "Saved "+ dtFormat(ob.published) + "<br/><br/>";
		content += "User      : "+ encrptUser + "<br/><br/>";
		content += "PassPhrase: "+ encrptBody + "<br/><br/>";
		$("#entryDisplay").html(content);
	});
	
	//Listen for delete clicks
	$("#deleteEntrySubmit").on("touchstart", function(e) {
		e.preventDefault();
		if (confirm('Are you sure you want to delete this entry?')) {
    		pwd.deleteEntry(recordID, function() {
			pageLoad("main.html");
			});
		} else {
    	// Do nothing!
		}
			
	});
	
	//Listen for edit click
	$("#editEntrySubmit").on("touchstart", function(e) { 
			e.preventDefault();
			console.log("edit click");
			var id = $(this).data("id");
			pageLoad("edit.html?id="+id);
	});
});

$(document).on("pageload", "#editPage", function(e) {

	var recordID = Number(e.detail.id);
	pwd.getEntry(recordID, function(ob) {
		var encrptTitle = CryptoJS.TripleDES.decrypt(ob.title, scrtPasPhrase);
		encrptTitle = encrptTitle.toString(CryptoJS.enc.Latin1);
		var encrptUser = CryptoJS.TripleDES.decrypt(ob.user, scrtPasPhrase);
		encrptUser = encrptUser.toString(CryptoJS.enc.Latin1);
		var encrptBody = CryptoJS.TripleDES.decrypt(ob.body, scrtPasPhrase);
		encrptBody = encrptBody.toString(CryptoJS.enc.Latin1);
		
		//var content = "<h2>" + encrptTitle + "</h2>";
		//content += "Written "+dtFormat(ob.published) + "<br/><br/>";
		//content += "User: "+encrptUser+ "<br/><br/>";
		//content += "PassPhrase: "+encrptBody+ "<br/><br/>";
		//$("#entryDisplay").html(content);
		
		$("#editTitle").val(encrptTitle); 
		$("#editBody").val(encrptBody);
		$("#editUser").val(encrptUser);
		
		
	});
	
	//Listen for save clicks
		$("#editSubmit").on("touchstart", function(e) {
		e.preventDefault();
		//grab the values
		var recordID = globalRecordID;
		var title = $("#editTitle").val();
		var body = $("#editBody").val();
		var user = $("#editUser").val();
		var img = "";
		//store!
		pwd.updateEntry({title:title,user:user,body:body,image:img,recordID:recordID}, function() {
			pageLoad("main.html");
		});
		
	});
		
	
});



$(document).on("pageload", "#addPage", function(e) {

	
	$("#addEntrySubmit").on("touchstart", function(e) {
		e.preventDefault();
		//grab the values
		var title = $("#entryTitle").val();
		var body = $("#entryBody").val();
		var user = $("#entryUser").val();
		var img = "";
		//store!
		pwd.saveEntry({title:title,user:user,body:body,image:img}, function() {
			pageLoad("main.html");
		});
		
	});
});




function dtFormat(input) {
    if(!input) return "";
	input = new Date(input);
    var res = (input.getMonth()+1) + "/" + input.getDate() + "/" + input.getFullYear() + " ";
    var hour = input.getHours()+1;
    var ampm = "AM";
	if(hour === 12) ampm = "PM";
    if(hour > 12){
        hour-=12;
        ampm = "PM";
    }
    var minute = input.getMinutes()+1;
    if(minute < 10) minute = "0" + minute;
    res += hour + ":" + minute + " " + ampm;
    return res;
}
