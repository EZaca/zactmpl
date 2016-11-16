Have you read the [`basic`](https://github.com/EZaca/zactmpl/tree/master/sample/basic/README.md)?

We recommend to see the [`script-tag sample`](https://github.com/EZaca/zactmpl/tree/master/sample/script-tag/README.md) before continue.

# Script Tag printing the value

You can write Javascript code between `<?=` and `?>` tags.

The last value caught in the code will be printed. For example, let's say you want to print your amazing variable `myVariable`:

    <?= myVariable ?>

And that will be done!

The code executed is a simple Javascript, and like any Javascript code, you can write whatever you want:

    <?= myVariable; ?>
    <?= (x=2) ?>
    <?= (function(){ return "Text" })(); ?>

But if something fail, an error will be thrown. It can be a SyntaxError or any other problem. If an error is thrown, all the process is stopped and the error will continue to propagate until someone catch it. It is like any regular Javascript! So...

    <?= thisVarNotExists ?>

    This code will throw...
    Uncaught ReferenceError: thisVarNotExists is not defined

It is valid to `<?= ?>` and `<? ?>` tags, and any other Javascript code.

Now, let's say your code works, but you have many results:

    Hello, the number is <?= 1; 2; 3; ?>!

OK! That's not an error! "1" could return if it were alone, but it will be overwritten by "2", and the "2" by the "3". So, the result will be `Hello, the number is 3!`. Only the last will be considered.

It is important, because you can miss something doing like that:

    Value is <?= 1; console.log("Hello"); ?>

The console (if passed to the sandbox) will log the "Hello", but the result will not be 1. This script returns `Value is undefined`, because `console.log` returns undefined, and undefined converted to String is "undefined".

Of course, if that's so, you can use those funny conditions:

    E-mail: <?= email || '(not provided)' ?>

But remember: in this example, if the variable `email` evalutes to `false`, it will write "(not provided)". But if the variable was not passed to the sandbox, it will throw an error because the variable does not exist!

-------

I have no more to you for now! See the `sample.js` or run it (`node sample.js`) to see the result. It will print a simple a title tag.

See you next time!