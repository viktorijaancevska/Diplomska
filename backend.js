var firebase = require("firebase");
var admin = require("firebase-admin");

var serviceAccount = require("./service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://diplomska-615a0.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("/rules");
var firebaseRoot = db.ref("/ratings");
var user = firebaseRoot.child("-Kc7JUs5LKf7EHrO6hOe"); //user 547 in excel, with max ratings
var matrix = [];
var userNumber = 0;

function init(){
	console.log("reading data...");
	firebaseRoot.on("child_added", function(snapshot, prevChildKey) {
  		var userArray = snapshot.val();
  		var userRatings = Array.apply(null, Array(9125)).map(Number.prototype.valueOf,0);
  		for (var i = 0; i < userArray.length; i++) {
  			userItem = userArray[i];
  			var index = parseInt(userItem.movieID,10);
  			var rating = parseInt(userItem.rating,10);
  			userRatings[index] = rating;
  		}
  		matrix[userNumber] = userRatings;
  		userNumber++;
	});

	firebaseRoot.on("value", function(snapshot, prevChildKey) {
		console.log("done reading");
	});		
}

init()
