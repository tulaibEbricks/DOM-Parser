// const htmlParser = require('htmlparser2');
// const circularJSON = require('circular-json');
const express = require('express');
const bodyParser = require('body-parser');
// const request = require('request');
// const boundingRect = require('bounding-client-rect');

const websiteGrabber = require('./Components/webpageGrabber');
const elementsMarker = require('./Components/elementsMarker');
const jsonWriter = require('./Components/JSONWriter');


const app = express();
app.use(bodyParser.json());
const screenShotName = 'webpage.png';
const screenShotPath = screenShotName;
const jsonFileName = 'interactiveElements.json';
const jsonFilePath = '../' + jsonFileName;
var websiteURL;
var pageWidth;
var pageMaxHeight;
var pageHeight;
var elementsDataDictionary;

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
        const responseString = 'Screenshot taken at ' + Date.now().toString()
        res.json(responseString)
    })  
})

app.get('/markScreenshot', (req, res) => {
    markInteractiveElements().then (() => {
        const responseString = 'Screenshot marked at ' + Date.now().toString()
        res.json(responseString)
    })  
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
    await websiteGrabber.takeScreenshot(screenShotPath);
    elementsDataDictionary = await websiteGrabber.grabPageData();
    await websiteGrabber.closeBrowser();
}

async function markInteractiveElements() {
    await elementsMarker.markInteractiveElements(elementsDataDictionary, screenShotPath, pageWidth, pageHeight);
}

app.listen(3000, () => {
    console.log('app is running on port 3000')
})



