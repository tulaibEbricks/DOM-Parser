// const htmlParser = require('htmlparser2');
// const circularJSON = require('circular-json');
// const express = require('express');
// const request = require('request');
// const boundingRect = require('bounding-client-rect');
// const puppeteer = require('puppeteer');
const websiteGrabber = require('./Components/webpageGrabber');
const elementsMarker = require('./Components/elementsMarker');
const jsonWriter = require('./Components/JSONWriter');


// const app = express();
const screenWidth = 1024;
const screenMaxHeight = 2600;
const webpageURL = 'https://www.raywenderlich.com/';
const screenShotName = 'webpage.png';
const screenShotPath = screenShotName;
const jsonFileName = 'interactiveElements.json';
const jsonFilePath = '../' + jsonFileName;

async function grabPage() {
    const screenHeight = await websiteGrabber.setupPage(screenWidth, screenMaxHeight, webpageURL);
    await websiteGrabber.takeScreenshot(screenShotPath);
    const elementsDictionary = await websiteGrabber.grabPageData();
    await elementsMarker.markInteractiveElements(elementsDictionary, screenShotPath, screenWidth, screenHeight);
    await websiteGrabber.closeBrowser();
    await jsonWriter.writeJSONToFile(elementsDictionary, jsonFilePath);
}

grabPage();



