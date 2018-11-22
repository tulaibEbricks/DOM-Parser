// const htmlParser = require('htmlparser2');
// const circularJSON = require('circular-json');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const request = require('request');
// const boundingRect = require('bounding-client-rect');

const websiteGrabber = require('./Components/webpageGrabber');
const elementsMarker = require('./Components/elementsMarker');
const jsonWriter = require('./Components/JSONWriter');
const webPageData = require('./Models/webPageData');


const app = express();
app.use(bodyParser.json());
const screenShotName = 'webpage.png';
const screenShotPath = screenShotName;
const jsonFileName = 'interactiveElements.json';
const jsonFilePath = '../' + jsonFileName;
const dbName = 'domParser';
const url = 'mongodb://localhost/' + dbName;
var websiteURL;
var pageWidth;
var pageMaxHeight;
var pageHeight;
var elementsDataDictionary;



// Use connect method to connect to the server
mongoose.connect(url, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("Connected successfully to server");
});

app.get('/grabPage', (req, res) => {
    const {webPage, screenWidth, screenMaxHeight} = req.query;
    grabPage(webPage, parseInt(screenWidth), parseInt(screenMaxHeight)).then (() => {
        res.json('Screenshot Taken!!')
    })  
})

app.post('/grabPageData', (req, res) => {
    const {webPage, screenWidth, screenMaxHeight} = req.body;
    websiteURL = webPage;
    pageWidth = parseInt(screenWidth);
    pageMaxHeight = parseInt(screenMaxHeight);
    grabPageData().then (() => {
        const responseString = 'Data grabbed at ' + Date.now().toString()
        res.json(responseString)
    })  
})

app.get('/markScreenshot', (req, res) => {
    const { webURL } = req.query;
    console.log(webURL)
    markInteractiveElements(webURL, res)
})

async function grabPage(webPage, screenWidth, screenMaxHeight) {
    const screenHeight = await websiteGrabber.setupPage(screenWidth, screenMaxHeight, webPage);
    await websiteGrabber.takeScreenshot(screenShotPath);
    const elementsDictionary = await websiteGrabber.grabPageData();
    await elementsMarker.markInteractiveElements(elementsDictionary, screenShotPath, screenWidth, screenHeight);
    await websiteGrabber.closeBrowser();
    await jsonWriter.writeJSONToFile(elementsDictionary, jsonFilePath);
}

async function grabPageData() {
    pageHeight = await websiteGrabber.setupPage(pageWidth, pageMaxHeight, websiteURL);
    elementsDataDictionary = await websiteGrabber.grabPageData();
    const newWebPageData = new webPageData({
        webURL: websiteURL,
        width: pageWidth,
        height: pageHeight,
        elementsDict: elementsDataDictionary,
        timeStamp: Date.now().toString()
    })
    newWebPageData.save(function (err, newWebPageData) {
        if (err) return console.error(err);
      });
    await websiteGrabber.closeBrowser();
}

async function markInteractiveElements(webURL, res) {
    webPageData.findOne({ webURL: webURL }, (err, newWebPageData) => {
        if (err) return console.error(err);
        websiteGrabber.takeScreenshot(newWebPageData.width, newWebPageData.height, newWebPageData.webURL, screenShotPath).then(() => {
            elementsMarker.markInteractiveElements(newWebPageData.elementsDict, screenShotPath, newWebPageData.width, newWebPageData.height).then(() => {
                const responseString = 'Screenshot taken and marked at ' + Date.now().toString()
                res.json(responseString)
            });
        }); 
    });
}

app.listen(3000, () => {
    console.log('app is running on port 3000')
})



