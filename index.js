"use strict";

var assert = require("assert");
var https = require("https");
var request = require("request");
var MongoClient = require("mongodb").MongoClient;

var facebookPageToken = process.env["FACEBOOK_PAGE_TOKEN"];
var VERIFY_TOKEN = "mongodb_atlas_token";
var mongoDbUri = process.env["MONGODB_ATLAS_CLUSTER_URI"];

let cachedDb = null;

exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  var httpMethod;

  if (event.context != undefined) {
    httpMethod = event.context["http-method"];
  } else {
    //used to test with lambda-local
    httpMethod = "PUT";
  }

  // process GET request (for Facebook validation)
  if (httpMethod === "GET") {
    console.log("In Get if loop");
    var queryParams = event.params.querystring;
    var rVerifyToken = queryParams["hub.verify_token"];
    if (rVerifyToken === VERIFY_TOKEN) {
      var challenge = queryParams["hub.challenge"];
      callback(null, parseInt(challenge));
    } else {
      callback(null, "Error, wrong validation token");
    }
  } else {
    // process POST request (Facebook chat messages)
    var messageEntries = event["body-json"].entry;
    console.log("message entries are " + JSON.stringify(messageEntries));
    for (var entryIndex in messageEntries) {
      var messageEntry = messageEntries[entryIndex].messaging;
      for (var messageIndex in messageEntry) {
        var messageEnvelope = messageEntry[messageIndex];
        var sender = messageEnvelope.sender.id;
        if (messageEnvelope.message && messageEnvelope.message.text) {
          var onlyStoreinAtlas = false;
          //the weather response the function sends sendTextMessage comes back to Lambda as an echo and in this case, we only want to store it in Atlas, not process it through Yahoo's weather API
          if (
            messageEnvelope.message.is_echo &&
            messageEnvelope.message.is_echo == true
          ) {
            console.log("only store in Atlas");
            onlyStoreinAtlas = true;
          }
          if (!onlyStoreinAtlas) {
            var location = messageEnvelope.message.text;
            var weatherEndpoint =
              "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22" +
              location +
              "%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
            request(
              {
                url: weatherEndpoint,
                json: true
              },
              function(error, response, body) {
                try {
                  var condition = body.query.results.channel.item.condition;
                  var response =
                    "Today's temperature in " +
                    location +
                    " is " +
                    condition.temp +
                    ". The weather is " +
                    condition.text +
                    ".";
                  console.log(
                    "The response to send to Facebook is: " + response
                  );
                  sendTextMessage(sender, response);
                  storeInMongoDB(messageEnvelope, callback);
                } catch (err) {
                  console.error(
                    "error while sending a text message or storing in MongoDB: ",
                    err
                  );
                  sendTextMessage(sender, "There was an error.");
                }
              }
            );
          } else {
            storeInMongoDB(messageEnvelope, callback);
          }
        } else {
          process.exit();
        }
      }
    }
  }
};

function sendTextMessage(senderFbId, text) {
  var json = {
    recipient: { id: senderFbId },
    message: { text: text }
  };
  var body = JSON.stringify(json);
  var path = "/v2.6/me/messages?access_token=" + facebookPageToken;
  var options = {
    host: "graph.facebook.com",
    path: path,
    method: "POST",
    headers: { "Content-Type": "application/json" }
  };
  var callback = function(response) {
    var str = "";
    response.on("data", function(chunk) {
      str += chunk;
    });
    response.on("end", function() {});
  };
  var req = https.request(options, callback);
  req.on("error", function(e) {
    console.log("problem with request: " + e);
  });

  req.write(body);
  req.end();
}

function storeInMongoDB(messageEnvelope, callback) {
  if (cachedDb && cachedDb.serverConfig.isConnected()) {
    sendToAtlas(cachedDb, messageEnvelope, callback);
  } else {
    console.log(`=> connecting to database ${mongoDbUri}`);
    MongoClient.connect(mongoDbUri, function(err, db) {
      assert.equal(null, err);
      cachedDb = db;
      sendToAtlas(db, messageEnvelope, callback);
    });
  }
}

function sendToAtlas(db, message, callback) {
  db.collection("records").insertOne({
    facebook: {
      messageEnvelope: message
    }
  }, function(err, result) {
    if (err != null) {
      console.error("an error occurred in sendToAtlas", err);
      callback(null, JSON.stringify(err));
    } else {
      var message = `Inserted a message into Atlas with id: ${result.insertedId}`;
      console.log(message);
      callback(null, message);
    }
  });
}
