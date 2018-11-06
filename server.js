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
    await page.goto('https://example.com');
    const interactableElements = await page.$('a');
    const dimensions = await interactableElements.boundingBox()

    console.log('Dimensions:', dimensions);
    const list = await page.evaluateHandle(() => {
        return Array.from(document.getElementsByTagName('a')).map(a => a.href);
      });
      console.log(await list.jsonValue());
  
    await browser.close();
  })();

request('http://example.com',(error, response, body) => {
    if (body !== null) {
        // console.log(body);
        var domHandler = new htmlParser.DomHandler(function(parsingError, dom) {
            if (dom !== null) {
                const referenceElements = htmlParser.DomUtils.getElementsByTagName("a", dom)[0];
                const stringifiedData = circularJSON.stringify(referenceElements);
                // console.log(referenceElements);
                // var rect = boundingRect(referenceElements);
                // console.log(rect);
                writeFile('../parsedData.json', stringifiedData, function(err) {
                    if (err) {
                        console.log(err);
                    }
                    });
            } else {
                console.log(parsingError);
            }
        });
        var parser = new htmlParser.Parser(domHandler);
        parser.write(body);
        parser.end();
    } else {
        console.log(error);
    }
});
