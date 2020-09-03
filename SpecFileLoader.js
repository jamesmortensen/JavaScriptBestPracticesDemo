// SpecFileLoader.js
// See https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js#get-all-the-files
// https://github.com/webdriverio/webdriverio/issues/4845#issuecomment-561259495


/**
 * This is at the top because it's what we expect to use outside the module.
 * Uncle Bob says "Good code should read like a newspaper, with the headings
 * at the top."
 */
function getAllSpecFiles(specFilePath) {
    return getFilesMatching(specFilePath, fileIsSpecFile);
}


/**
 * Another function we could make public, but instead it is cleaner to encapsulate
 * it with a more specific function name. This function can be reused over and over
 * to build new functions. We could also extract out the compareFunction and 
 * inject whatever sorting algorithm we want to use to sort the data.
 *
 * Since reusable functions are more complex, it's my belief that they should remain
 * private. To reuse it, we create a more specific wrapper around it. See
 * getAllFilesWithLoginFirst for an example.
 */
function getAllSpecFilesWithSpecifiedFile(specFilePath, loginSpecFilename) {

    var arrayOfFiles = getFilesMatching(specFilePath, fileIsSpecFile);
    arrayOfFiles.sort(moveLoginSpecToTop);
    return arrayOfFiles;


    // this function is only needed here, so we limit scope to this fn only.
    function moveLoginSpecToTop(a, b) {
        if (a.lastIndexOf(loginSpecFilename) !== -1)
            return -1;
        else
            return 0;
    }
}


/**
 * One of only two public functions.
 *
 * More specific version of getAllSpecFilesWithSpecifiedFile. Uses the 
 * open/closed principle in that we create this behavior without modifying
 * other code, using delegation.
 **/
function getAllSpecFilesWithLoginFirst(specFilePath) {
    return getAllSpecFilesWithSpecifiedFile(specFilePath, 'LoginTest.js');
}


// private file matcher - see UnitTests below for the tests
function fileIsSpecFile(file) {
    return file.match(/.*\.js$/i) !== null ? true : false;
}


/**
 * @param {string} specFilePath - Path to the folder containing the files.
 * @param {function} fileMatches - Function which determines if a file matches a pattern.
 * @return {array} The collection of matching file paths.
 */ 
function getFilesMatching(specFilePath, fileMatches) {

    // modules are only used inside this function
    const fs = require("fs");
    const path = require("path");

    /*
     * This function calls itself. Also, it's privately scoped since we don't 
     * need it elsewhere. 
     */
    const getArrayOfFilesRecursively = function (dirPath, arrayOfFiles) {
        files = fs.readdirSync(dirPath);

        arrayOfFiles = arrayOfFiles || [];

        files.forEach(function (file) {
            if (fileIsADirectory(dirPath + "/" + file)) {
                arrayOfFiles = getArrayOfFilesRecursively(dirPath + "/" + file, arrayOfFiles);
            } else if (fileMatches(file)) {
                //console.debug('directory name is: ' + process.cwd());
                arrayOfFiles.push(path.join(process.cwd(), dirPath, "/", file));
            }
        });

        //console.log(arrayOfFiles);

        return arrayOfFiles;
    }

    // locally scoped. It's at the bottom so we don't waste time trying to understand it.
    function fileIsADirectory(dirPath) {
        return fs.statSync(dirPath).isDirectory()
    }

    return getArrayOfFilesRecursively(specFilePath);
}





/**
 * This is a variation of the constructor pattern. We set this to _self.
 * It is helpful inside inner closures when 'this' may not refer to the 
 * outer closure.
 **/
const UnitTests = function () {
    var _self = this;

    var testFilenameAndExpectedResults = [
        { 'test': false },
        { 'test.js': true },
        { 'test.spec.js': true },
        { 'test.png': false },
        { 'test.pjsng': false },
        { 'test.jsng': false },
        { 'test.JS': true },
        { 'test.json': false },
        { 'TestSpec.js': true },
        { 'Test.Js': true },
        { 'testTheJsFiles.sh': false },
        { 'test_js': false },
        { 'test_js.': false },
        { 'test.js.png': false }
    ];

    _self.testFileIsSpecFile = () => {
        const allTestsPassing = [];

        for (var index in testFilenameAndExpectedResults) {
            var testCase = testFilenameAndExpectedResults[index];

            var filename = Object.keys(testCase)[0];
            var expectedResult = testCase[filename];

            var isFileSpecFile = fileIsSpecFile(filename);
            //console.debug(isFileSpecFile);

            var isPassing = isFileSpecFile === expectedResult;
            allTestsPassing.push(isPassing);
            console.debug('filename: ' + filename
                + '\n expected: ' + expectedResult
                + ' \n actual: ' + isFileSpecFile
                + ' \n passing: ' + isPassing);
        }

        if (allTestsPass()) {
            console.log('All tests on fileIsSpecFile passed.');
        } else {
            console.error('Some tests on fileIsSpecFile failed!');
        }

        function allTestsPass() {
            return allTestsPassing.reduce((accumulator, current) => {
                if (!current)
                    accumulator = false;
                return accumulator;
            });
        }
    }
}

/**
 * This is a variation of the constructor pattern. We set this to _self.
 * It is helpful inside inner closures when 'this' may not refer to the 
 * outer closure.
 **/ 
const IntegrationTests = function () {
    var _self = this;

    // keep constants inside the module where they're used.
    const SPEC_FOLDER_NAME = './__SpecFileLoader-testFiles__';

    _self.testGetSpecFiles = () => {
        var jsFiles = getAllSpecFiles(SPEC_FOLDER_NAME);

        if (allFilesAreJSFiles(jsFiles))
            console.debug('Test to get all JS files passed.');
        else
            console.error('Test to get JS files failed.');
    }

    _self.testGetSpecFilesWithLoginFirst = () => {
        var jsFiles = getAllSpecFilesWithLoginFirst(SPEC_FOLDER_NAME);
        //console.debug('jsFiles...');
        //console.debug(jsFiles);
        var firstFile = jsFiles[0];

        if (allFilesAreJSFiles(jsFiles) && firstFileIsLoginTest(firstFile))
            console.debug('Test to get all JS files with LoginTest first passed.');
        else
            console.error('Test to get JS files with LoginTest first failed.');

    }

    // private function
    function fileHasJavaScriptFileExtension(file) {
        return file.lastIndexOf('js') === file.length - 2;
    }

    // another way to make a private function
    var allFilesAreJSFiles = (jsFiles) => {
        console.log(jsFiles);
        var filesAreJsFiles = true;
        for (var index in jsFiles) {
            var file = jsFiles[index];
            if (!fileHasJavaScriptFileExtension(file))
                filesAreJsFiles = false;
        }
        return filesAreJsFiles;
    }

    function firstFileIsLoginTest(firstFile) {
        return firstFile.lastIndexOf('LoginTest.js') === firstFile.length - 12;
    }

};


if (onlyIfModuleIsNotLoadedViaClient()) {
   
    runUnitTests();
    runIntegrationTests();

    function runUnitTests() {
        // constructor pattern objects must be created using 'new' keyword.
        const unitTests = new UnitTests();
        unitTests.testFileIsSpecFile();
    }

    function runIntegrationTests() {
        const integrationTests = new IntegrationTests();
        integrationTests.testGetSpecFiles();
        integrationTests.testGetSpecFilesWithLoginFirst();
    }
}


function onlyIfModuleIsNotLoadedViaClient() {
    return process.argv[1].match('SpecFileLoader.js') !== null;
}


// In Node.js, we "export" whatever we need to be public outside the module.
module.exports = {
    getAllSpecFilesWithLoginFirst: getAllSpecFilesWithLoginFirst,
    getAllSpecFiles: getAllSpecFiles
}
