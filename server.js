var fs = require('fs');
const htmlParser = require('htmlparser2');
const writeFile = require('write');
const circularJSON = require('circular-json');
const express = require('express');
const request = require('request');
const boundingRect = require('bounding-client-rect');
const puppeteer = require('puppeteer');
const pureImage = require('pureimage');

const app = express();
const screenWidth = 1024;
const screenMaxHeight = 2600;
const websiteURL = 'https://www.raywenderlich.com/';
const screenShotName = 'webpage.png';
var screenHeight;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(websiteURL);
    const websiteHeight = await page.evaluate('document.body.scrollHeight');
    calculateScreenshotHeight(websiteHeight);
    await page.setViewport({width: screenWidth, height: screenHeight})
    await page.screenshot({path: screenShotName});
    console.log(screenHeight);
    

    // const interactableElements = await page.$$eval('a', element => {
    //     return element;
    //     // return JSON.parse(JSON.stringify(element.style));//getComputedStyle(element);
    //     // return JSON.parse(JSON.stringify(getComputedStyle(element)));
    // });
    const interactiveElementTags = ['a', 'button', 'input'];
    const elementsDictionary = {};
    for (const tag of interactiveElementTags) {
        const interactableElements = await page.$$(tag);
        const elementsPropertyList = await elementsIterator(interactableElements)
        elementsDictionary[tag] = elementsPropertyList
    }

    await markInteractiveElements(elementsDictionary);
    
    const stringifiedData = JSON.stringify(elementsDictionary)
    // console.log(stringifiedData);
    writeFile('../parsedData.json', stringifiedData, function(err) {
        if (err) {
            console.log(err);
        }
    });
    await browser.close();
})();

async function elementsIterator(elements) {
    const elementsPropertyList = [];
    for (const element of elements) {
        const propertyDict = await loadElementProperties(element);
        elementsPropertyList.push(propertyDict);
    }
    return elementsPropertyList;
}

async function loadElementProperties(item) {
    const element = item.asElement();
    const propertyDict = {};
    if (element) {
        const tagName = await ( await element.getProperty( 'tagName' ) ).jsonValue();
        if (tagName !== "") 
            propertyDict['tagName'] = tagName
        
        const value = await ( await element.getProperty( 'value' ) ).jsonValue();
        if (value !== "") 
            propertyDict['value'] = value

        const title = await ( await element.getProperty( 'title' ) ).jsonValue();
        if (title !== "") 
            propertyDict['title'] = title

        const text = await ( await element.getProperty( 'text' ) ).jsonValue();
        if (text !== "") 
            propertyDict['text'] = text
        const link = await ( await element.getProperty( 'href' ) ).jsonValue();
        if (link !== "") 
            propertyDict['link'] = link
        const style = await ( await element.getProperty( 'style' ) ).jsonValue();
        const isEmpty = checkIfJSONIsEmpty(style)
        if (!isEmpty) {
            propertyDict['style'] = style
            // const nodeList = await getStyleValue(element, style);
            // console.log(nodeList);
        }
        const dimensions = await element.boundingBox()
        if (dimensions !== null)
            propertyDict['dimensions'] = dimensions
    }
    return propertyDict;
}

function checkIfJSONIsEmpty(json) {
    for(var key in json) {
        if(json.hasOwnProperty(key))
            return false;
    }
    return true;
}

async function markInteractiveElements(elementsDictionary) {
    const readImage = await pureImage.decodePNGFromStream(fs.createReadStream(screenShotName));
    console.log("size is",readImage.width,readImage.height);
    var markedImage = pureImage.make(screenWidth,screenHeight);
    var context = markedImage.getContext('2d');
    context.drawImage(readImage,
        0, 0, readImage.width, readImage.height, // source dimensions
        0, 0, screenWidth, screenHeight                 // destination dimensions
    );
    context.strokeStyle = 'rgba(255, 0, 0, 1.0)';
    for(const tag in elementsDictionary) {
        const elementsArray = elementsDictionary[tag];
        for (const elementDataDict of elementsArray) {
            if (elementDataDict.hasOwnProperty('dimensions')) {
                const dimensions = elementDataDict['dimensions'];
                context.strokeRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height);
            }
        }

    }
    var path = screenShotName;
    pureImage.encodePNGToStream(markedImage,fs.createWriteStream(path)).then(() => {
        console.log("done writing");
    });
}

function calculateScreenshotHeight(websiteHeight) {
    if (websiteHeight > screenMaxHeight) {
        screenHeight = screenMaxHeight;
    } else {
        screenHeight = websiteHeight;
    }
}

// async function getStyleValue(item, json) {
//     const element = item.asElement();
//     for(var key in json) {
//         const value = json[key];
//         // console.log(value);
//         const style1 = element.style.innerText;
//         // const style = await element.$$eval(value, node => {
//         //     console.log(node);
//         //     return node.cssText
//         // })
//         console.log(style1);
//     }
// }


