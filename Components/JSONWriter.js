const writeFile = require('write');

const writeJSONToFile = (elementsDictionary, filePath) => {
    const stringifiedData = JSON.stringify(elementsDictionary);
    writeFile(filePath, stringifiedData, function(err) {
        if (err) {
            console.log(err);
        }
    });
}

const printJSON = (elementsDictionary) => {
    const stringifiedData = JSON.stringify(elementsDictionary);
    console.log(stringifiedData);
}

module.exports = {
    writeJSONToFile,
    printJSON
}