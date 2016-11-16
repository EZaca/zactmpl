// Require
var fs = require('fs');
var ZacTmpl = require('../..');
var tmpl = new ZacTmpl();

// Read & Compile
var templateContent = fs.readFileSync(__dirname+'/template.txt');
var tree = tmpl.compile(templateContent);

// Use
var result = tmpl.make(tree);

// Show you it worked!
console.log('== GENERATED TEXT ==');
console.log(result);
console.log('== END GENERATED TEXT ==');

// Exit.