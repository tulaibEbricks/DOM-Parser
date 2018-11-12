var fs = require('fs');
const htmlParser = require('htmlparser2');
const writeFile = require('write');
const circularJSON = require('circular-json');
const express = require('express');
const request = require('request');
const boundingRect = require('bounding-client-rect');
const puppeteer = require('puppeteer');

const app = express();

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.google.com/');
    // const interactableElements = await page.$$eval('a', element => {
    //     return element;
    //     // return JSON.parse(JSON.stringify(element.style));//getComputedStyle(element);
    //     // return JSON.parse(JSON.stringify(getComputedStyle(element)));
    // });
    const interactableElements = await page.$$('a');
    // console.log(interactableElements);

    console.log( interactableElements.length );
    const elementsPropertyList = await elementsIterator(interactableElements)
    const stringifiedData = JSON.stringify(elementsPropertyList)
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
        propertyDict['tagName'] = tagName
        const text = await ( await element.getProperty( 'text' ) ).jsonValue();
        propertyDict['text'] = text
        const link = await ( await element.getProperty( 'href' ) ).jsonValue();
        propertyDict['link'] = link
        const style = await ( await element.getProperty( 'style' ) ).jsonValue();
        const isEmpty = checkIfJSONIsEmpty(style)
        if (!isEmpty) {
            propertyDict['style'] = style
            // const nodeList = await getStyleValue(element, style);
            // console.log(nodeList);
        }
        const dimensions = await element.boundingBox()
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


