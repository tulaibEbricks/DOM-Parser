var fs = require('fs');
const pureImage = require('pureimage');

const markInteractiveElements = async (elementsDictionary, screenShotPath, screenWidth, screenHeight) => {
    const readImage = await pureImage.decodePNGFromStream(fs.createReadStream(screenShotPath));
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
    var path = screenShotPath;
    pureImage.encodePNGToStream(markedImage,fs.createWriteStream(path)).then(() => {
        console.log("done writing");
    });
}

module.exports = {
    markInteractiveElements
}