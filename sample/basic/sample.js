// Require the tree:
// We are to levels inside the library (sample/basic), so we will require the
// module with "../..". When you are using the library through NPM, you should
// require "zactmpl" instead:
//
//     var ZacTmpl = require('zactmpl');
//
var ZacTmpl = require('../..');

// Create the template manager:
// We don't have any setting just now, but in the future the settings will be
// passed while creating the ZacTmpl instance.
var tmplInstance = new ZacTmpl();

// Compile a template string:
// Note the "who" is inside <?= ?>, which will return the value of the variable.
var intermediateTree = tmplInstance.compile('Hello, <?= who ?>!');

// Generate a text from the template:
var resultingText = tmplInstance.make(intermediateTree, {
	who:"guest" // will be global in the template script...
});

// Print the intermediate tree:
console.log('== INTERMEDIATE TREE ==');
console.log(intermediateTree.treeToString(1));
console.log('');

// Print the generated text:
console.log('== GENERATED TEXT ==');
console.log(resultingText);

// Exit.