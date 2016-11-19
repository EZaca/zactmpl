// Require
console.log('Requiring...');
var fs = require('fs');
var ZacTmpl = require('../..');

console.log('Creating...');
var tmpl = new ZacTmpl();

// Read & Compile
console.log('Reading from file...');
var templateContent = fs.readFileSync(__dirname+'/template.txt');

console.log('Compiling string...');
var tree = tmpl.compile(templateContent);

// Use
console.log('Using...');
var result = tmpl.make(tree, {
    'custom': 'Custom passed variable',
    'func': function(){ return String(Date()).match(/\d+:\d+:\d+/)[0]; },
    'log': function(text){ console.log(text); },
});

console.log('Saving to file...');
fs.writeFileSync(__dirname+'/result.log',result);

// Show you it worked!
console.log('');
console.log('GENERATED TEXT');
console.log('============================================================');
console.log(result);
console.log('============================================================');
console.log('END GENERATED TEXT');

// Exit.