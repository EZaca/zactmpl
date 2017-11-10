# ZacTemplate Engine

    Status: Frozen/Abandoned
    Contributors: see package.json file
    License: MIT (see LICENSE file)
    Since: November 14th, 2016.

Javascript template engine for NodeJS and derived works. The library provides a high level of isolation and control over the variables available to the templates.

The template engine depends only on VM module, distributed with NodeJS.

**Features:**
 - Mix Javascript and text: the template works like the PHP (Hypertext Preprocessor) language, and allow you to mix Javascript inside your text.
 - Use conditions and loops: the template allows you to write text conditionally and make `for`, `while` and `do` loops.
 - Isolation of context: the template scripts run in a sandboxed scope, and do not have access to the global context;

Planned features:
 - `break` or `continue` a loop;
 - Exit the build flow with the current text;
 - Middle step to include external texts.

# Installation and Basic Steps
To install the package you can use NPM:

    npm install zactmpl

We recommend to install it inside the project folder.

Example of use:
````js
// Require and create the class
var ZacTmpl = require('zactmpl');
var tmpl = new ZacTmpl;

// Compile a template
var compiledTmpl = tmpl.compile('Hello, <?= name ?>!');

// Build the template
var text = tmpl.make(compiledTmpl, {'name':'Zacarias'});

// Prints "Hello, Zacarias!" to the console
console.log(text);

// Show the intermediate tree
console.log(compiledTmpl.treeToString());
````

**More examples**

You can see examples of each feature in the "sample" directory. Each directorie have a README explaining the result, but you can see it by yourself executing `node sample.js` in the directory of the desired sample.

# Template Language

Let's see a complete HTML page presenting features of the language:

````
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title><?= page_title ?></title>
</head>
<body>
    <h1>Script Tag</h1>
    <?
        print("Lorem Ipsum");
    ?>

    <h2>Printable Tag</h2>
    <?= "<p>The page is called "+page_title+"</p>" ?>

    <h2>Condition</h2>
    @if(value > 5)
        <p>The value is greater than 5.</p>
    @elseif(value === 5)
        <p>The value is equal to 5.</p>
    @else
        <p>The value is lower than 5.</p>
    @endif

    <h2>FOR loop</h2>
    @for(var i=1; i<=10; i++)
        <p>Now counting: <?= i ?></p>
    @endfor

    <h2>WHILE loop</h2>
    <? var x=1 ?>
    @while(x <= 10)<?
        print("<p>X is "+x+"</p>");
        <? x++ ?>
    ?>@endwhile

    <h3>Plain while loop</h3>
    <?
        var y = 1;
        while(y = 10)
            print("<p>Y is "+y+"</p>");
    ?>

    <h2>DO_WHILE loop</h2>
    <? var z=1 ?>
    @do
        <p>Now counting: <? z ?></p>
    @endwhile(z < 10)
</body>
</html>
````

For more information, see the "sample" folder.

---
Use GitHub Issue whether something goes wrong.

Thanks!
