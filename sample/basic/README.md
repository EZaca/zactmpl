# Running the sample

Use a terminal and enter the `sample/basic` folder. Now type:

    node sample.js

If everything is OK, you will see the result. In our case, the default result
will print "Hello, guest!". See below for details.

# Basics

This example is a quick guide to ZacTemplate engine.

The `sample.js` script:

 - require the `zactmpl` library;
 - initialize the `ZacTmpl` instance;
 - compile a string to generate the intermediate tree;
 - use the intermediate tree to generate the final text.

## Requiring the library

After you have installed the module inside your `node_modules` folder, you can require it like you would do with other modules. The returned value is the main class to use the ZacTmpl engine.

    var ZacTmpl = require('zactmpl');

We store the main class required in some variable. In our case, we named the variable as `ZacTmpl`, the short form of Zac Template, but you may use any name you want.

## Initializing the instance

In this step, we create an instance of the ZacTmpl to manage one template.

    var tmplInstance = new ZacTmpl;

## Compiling a string

ZacTemplate Engine does not work with files. Instead, is our work to read any file and give it the content. This example is to be very basic, so we will use a literal hardcoded string.

    var intermediateTree = tmplInstance.compile('Hello, <?= who ?>');

Have you noticed that `<?= who ?>`? That means we want to write (`<?=`) the content of `who`.

The result of `compile` will be an intermediate tree. We can see the structure of the tree by calling `intermediateTree.treeToString()`. Remember to use the `console` to print it:

    console.log('INTERMEDIATE TREE:');
    console.log(intermediateTree.treeToString());

## Using the intermediate tree

Now we have compiled our template, we can use that generated tree to make a derivated text.

    var resultingText = tmplInstance.make(intermediateTree);

Only this last line will **throw an error**! We didn't gave the "who" variable, did we? So, when the Javascript tries to access the "who" in the global scope, it fails and throws an error. Any uncaught error will stop the `make` function and the other parts of code, like every Javascript code.

    var resultingText = tmplInstance.make(intermediateTree, {'who':'Eliakim'});

Oh! Now the resulting text will greets me! :) "Hello, Eliakim!". You can try it with your name changing the value of "who" in the `sample.js`. It is "guest" for now.

We can use the template more times, it is still there:

    var text2 = tmplInstance.make(intermediateTree, {'who':'guest'});
    var text3 = tmplInstance.make(intermediateTree, {'who':'John'}); // your name is John, right?
    var text4 = tmplInstance.make(intermediateTree, {'who':'Mary'});

You can use the `console` of NodeJS to write the text, or save in a file, or send through network.

-----

That's all! See you later! :)