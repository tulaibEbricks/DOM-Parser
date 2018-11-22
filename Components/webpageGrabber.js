const puppeteer = require('puppeteer');

const interactiveElementTags = ['a', 'button', 'input'];
var page;
var browser;

const setupPage = async (screenWidth, screenMaxHeight, webpageURL) => {
    await createPage(webpageURL);
    const websiteHeight = await page.evaluate('document.body.scrollHeight');
    const screenHeight = calculateScreenshotHeight(websiteHeight, screenMaxHeight);
    console.log(screenHeight);
    await page.setViewport({width: screenWidth, height: screenHeight});
    return screenHeight;
}

const takeScreenshot = async (screenWidth, screenHeight, webpageURL, screenShotPath) => {
    await createPage(webpageURL);
    await page.setViewport({width: screenWidth, height: screenHeight});
    await page.screenshot({path: screenShotPath});
}

const grabPageData = async () => {
    const elementsDictionary = await getInteractiveElements();
    return elementsDictionary;
}

const closeBrowser = async () => {
    await browser.close();
}

async function createPage(webpageURL) {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto(webpageURL);
}

async function getInteractiveElements() {
    const elementsDictionary = {};
    for (const tag of interactiveElementTags) {
        const interactableElements = await page.$$(tag);
        const elementsPropertyList = await elementsIterator(interactableElements)
        elementsDictionary[tag] = elementsPropertyList
    }
    return elementsDictionary;
}

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

function calculateScreenshotHeight(websiteHeight, screenMaxHeight) {
    if (websiteHeight > screenMaxHeight) {
        return screenMaxHeight;
    }
    return websiteHeight;
}

module.exports = {
    setupPage,
    takeScreenshot,
    grabPageData,
    closeBrowser
}


// const interactableElements = await page.$$eval('a', element => {
    //     return element;
    //     // return JSON.parse(JSON.stringify(element.style));//getComputedStyle(element);
    //     // return JSON.parse(JSON.stringify(getComputedStyle(element)));
    // });
// }

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
