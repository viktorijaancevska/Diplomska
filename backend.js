var firebase = require("firebase");
var admin = require("firebase-admin");
var math = require('mathjs');

var serviceAccount = require("./service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://diplomska-615a0.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("/rules");
var firebaseRatings = db.ref("/ratings");
var firebaseMovies = db.ref("/movies");
var firebaseSimilarities = db.ref("/similarities");
var user = firebaseRatings.child("-Kc7WM3BkSo8CfBPf2W6"); //user 547 in excel, with max ratings
var matrix = [];
var similarMatrix = [];
var userNumber = 0;
var similarMatrixNumber = 0;
var similarities = [];

function init(){
	console.log("reading data...");
	firebaseRatings.on("child_added", function(snapshot, prevChildKey) {
  		var userArray = snapshot.val();
  		var userRatings = Array.apply(null, Array(9125)).map(Number.prototype.valueOf,0);
  		for (var i = 0; i < userArray.length; i++) {
  			userItem = userArray[i];
  			var index = parseInt(userItem.itemNumber,10);
  			var rating = parseInt(userItem.rating,10);
  			userRatings[index-1] = rating;
  		}
  		matrix[userNumber] = userRatings;
  		userNumber++;
	});

	firebaseRatings.once("value", function(snapshot, prevChildKey) {
		console.log("done reading");
		for(var i = 0; i < 9125; i++){
			generateMatrixForSimilarty(0,i);	
		}
		console.log("done with similarities");
		for(var i = 0; i < 9125; i++){
			console.log(similarities[i]);
		}
		
	});		
}

function generateMatrixForSimilarty(i, j){
	console.log("generating matrix for similarity for i & j....");
	similarMatrix = [];
	similarMatrixNumber = 0;
	for(var k = 0; k < matrix.length; k++) {
		var user = matrix[k];
		var userRatingI = user[i];
		var userRatingJ = user[j];
		if (userRatingI != 0 && userRatingJ != 0) {
			similarMatrix[similarMatrixNumber] = user;
			similarMatrixNumber++;
		}
	}
	if (similarMatrix.length == 0) {
		similarities[similarities.length] = -5;
	}
	else {
		calculateAdjustedCosineSimilarity(i,j);	
	}
}

function calculateAdjustedCosineSimilarity(i,j){
	console.log("calculating adjusted cosine similarity for i & j");
	var nominator = 0;
	var denominatorI = 0;
	var denominatorJ = 0;
	for(var k = 0; k < similarMatrix.length; k++){
		var user = similarMatrix[k];
		var userAverage = 0;
		var numberOfRatings = 0;
		for(var l = 0; l < user.length; l++){
			var rating = user[l];
			if (rating > 0) {
				userAverage += rating;	
				numberOfRatings++;
			}
		}
		userAverage /= numberOfRatings;
		var Ri = user[i];
		var Rj = user[j];
		nominator += (Ri - userAverage) * (Rj - userAverage);
		denominatorI += (Ri - userAverage) * (Ri - userAverage);
		denominatorJ += (Rj - userAverage) * (Rj - userAverage);
	}
	var similarity = nominator / (math.sqrt(denominatorI) * math.sqrt(denominatorJ));
	similarities[similarities.length] = similarity;
	console.log("done calculating");
	console.log("similarity between " + i + " and " + j + " is: " +similarity);
}

init()
