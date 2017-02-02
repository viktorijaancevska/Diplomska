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
var user = firebaseRoot.child("-Kbv0__3COasMhlYZtat");
var matrix = [];
var userNumber = 0;

function init(){
	firebaseRoot.on("child_added", function(snapshot, prevChildKey) {
  		var userArray = snapshot.val();
  		for (var i = 0; i < userArray.length; i++) {
  			userItem = userArray[i];
  			var userRatings = [];
  			userRatings[userItem.movieID] = userItem.rating;
  		}
  		matrix[userNumber] = userRatings;
  		console.log("matrixx");
  		console.log(userRatings);
  		userNumber++;
	});	
}

init()
