var firebase = require("firebase");
var admin = require("firebase-admin");
var math = require('mathjs');
var Matrix = require('node-matrix');
var fs = require('fs');

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
var matrix = Matrix({ rows: 671, columns: 9125 });
var similarMatrix = [];
var similarities = Matrix({ rows: 9125, columns: 9125, values: -5 });
var idx = 0;

function init(){
	console.log("reading data...");
	firebaseRatings.on("child_added", function(snapshot, prevChildKey) {
  		var userArray = snapshot.val();
  		var userRatings = Array.apply(null, Array(9125)).map(Number.prototype.valueOf,0);
  		for (var i = 0; i < userArray.length; i++) {
  			userItem = userArray[i];
  			var index = parseFloat(userItem.itemNumber,10);
  			var rating = parseFloat(userItem.rating,10);
  			matrix[idx][index-1] = rating;
  		}
  		idx++;
	});

	firebaseRatings.once("value", function(snapshot, prevChildKey) {
		console.log("done reading");
		for(var i = 0; i < 9125; i++){
			for(var j = 0; j < 9125; j++){
				if (i != j) {
					if (similarities[i][j] == -5 && similarities[j][i] == -5) {
						generateMatrixForSimilarty(i,j);
					}
				}
				else {
					similarities[i][j] = 1;
					similarities[j][i] = 1;
				}
			}	
		}
		// for(var i = 8000; i < 9125; i++){
		// 	fs.writeFile("./similarities.txt", similarities[i] + "\n", function(err) {
  //   			if(err) {
  //       			return console.log(err);
  //   			}
  //   			console.log("pushed" + i);
		// 	});
		// }
		console.log("done with similarities");
	});		
}

function calculatePredictionForUserForItem(){

}

function generateMatrixForSimilarty(i, j){
	// console.log("generating matrix for similarity for i & j....");
	similarMatrix = [];
	for(var k = 0; k < matrix.dimensions[0]; k++) {
		if (matrix[k][i] != 0 && matrix[k][j] != 0) {
			similarMatrix[similarMatrix.length] = matrix[k];
		}
	}
	if (similarMatrix.length == 0) {
		similarities[i][j] = -1;
		similarities[j][i] = -1;
	}
	else {
		calculateAdjustedCosineSimilarity(i,j);	
	}
}

function calculateAdjustedCosineSimilarity(i,j){
	// console.log("calculating adjusted cosine similarity for i & j");
	var nominator = 0;
	var denominatorI = 0;
	var denominatorJ = 0;
	for(var k = 0; k < similarMatrix.length; k++){
		var userAverage = 0;
		var numberOfRatings = 0;
		for(var l = 0; l < similarMatrix[k].length; l++){
			var rating = similarMatrix[k][l];
			if (rating > 0) {
				userAverage += rating;	
				numberOfRatings++;
			}
		}
		userAverage /= numberOfRatings;
		nominator += (similarMatrix[k][i] - userAverage) * (similarMatrix[k][j] - userAverage);
		denominatorI += (similarMatrix[k][i] - userAverage) * (similarMatrix[k][i] - userAverage);
		denominatorJ += (similarMatrix[k][j] - userAverage) * (similarMatrix[k][j] - userAverage);
	}
	var denominator = (math.sqrt(denominatorI) * math.sqrt(denominatorJ));
	if (denominator == 0) {
		similarities[i][j] = -1;
		similarities[j][i] = -1;
	}
	else {
		var similarity = nominator / denominator;
		similarities[i][j] = similarity;
		similarities[j][i] = similarity;	
	}
	// console.log("done calculating");
	// console.log("similarity between " + i + " and " + j + " is: " +similarity);
}

init()
