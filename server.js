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
    const interactableElements = await page.$$('a');
    console.log( interactableElements.length );
    // interactableElements.forEach(elementsIterator);
    const elementsPropertyList = [];
    for (const element1 of interactableElements) {
        const element = element1.asElement();
        if (element) {
            const propertyDict = {};
            const tagName = await ( await element.getProperty( 'tagName' ) ).jsonValue();
            propertyDict['tagName'] = tagName
            const text = await ( await element.getProperty( 'text' ) ).jsonValue();
            propertyDict['text'] = text
            const link = await ( await element.getProperty( 'href' ) ).jsonValue();
            propertyDict['link'] = link
            const dimensions = await element.boundingBox()
            propertyDict['dimensions'] = dimensions
            
            elementsPropertyList.push(propertyDict);
        }
    }
    // console.log(JSON.stringify(elementsPropertyList));
    const stringifiedData = JSON.stringify(elementsPropertyList)
    writeFile('../parsedData.json', stringifiedData, function(err) {
        if (err) {
            console.log(err);
        }
    });
    // const dimensions = await interactableElements.boundingBox()
    // console.log('Dimensions:', dimensions);
    // const inner_html = await page.evaluate( () => document.querySelector('a').tagName );
    // console.log( inner_html );
    // const inner_html1 = await ( await interactableElements.getProperty( 'href' ) ).jsonValue();
    // console.log( inner_html1 );
    // const list = await page.evaluate(() => {
    //     return Array.from(document.getElementsByTagName('a')).map(a => a.href);
    // });
    // console.log(await list);

    // const listHandle = await page.evaluateHandle(() => document.body.children);
    // const properties = await listHandle.getProperties();
    // const children = [];
    // for (const property of properties.values()) {
    // const element = property.asElement();
    // if (element)
    //     children.push(element);
    // }
    // console.log('children:', children);
    // children;
    await browser.close();
  })();

  async function elementsIterator(item, index, arr) {
    const element = item.asElement();
    if (element) {
        const dimensions = await element.boundingBox()
        console.log('Dimensions:', dimensions);
        const inner_html1 = await ( await element.getProperty( 'href' ) ).jsonValue();
        console.log(await inner_html1 );
        break
    }
}

// request('http://example.com',(error, response, body) => {
//     if (body !== null) {
//         // console.log(body);
//         var domHandler = new htmlParser.DomHandler(function(parsingError, dom) {
//             if (dom !== null) {
//                 const referenceElements = htmlParser.DomUtils.getElementsByTagName("a", dom)[0];
//                 const stringifiedData = circularJSON.stringify(referenceElements);
//                 // console.log(referenceElements);
//                 // var rect = boundingRect(referenceElements);
//                 // console.log(rect);
//                 writeFile('../parsedData.json', stringifiedData, function(err) {
//                     if (err) {
//                         console.log(err);
//                     }
//                     });
//             } else {
//                 console.log(parsingError);
//             }
//         });
//         var parser = new htmlParser.Parser(domHandler);
//         parser.write(body);
//         parser.end();
//     } else {
//         console.log(error);
//     }
// });
