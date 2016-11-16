(function(){

    var __engine = 'ZacTemplate Engine 0.0.1';

// -------------------------------------------------------------------------
// Reading the source
// ====================
// You may want to start from the bottom, on the export of the Wrapper, which
// call the functions, first the parse (or compiler) function and after the
// build. The parsing function call other, which call the huge one, and return
// the tree.
// 
// Let's dance, novice? Have fun!
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// -- Ensure to has the Tree implementation
// -------------------------------------------------------------------------

    var Tree;
    if (typeof ZacTmplTree === 'undefined')
        Tree = require('./zactmpltree.js');
    else
        Tree = ZacTmplTree;

// -------------------------------------------------------------------------
// -- Functions to Parse (called in chain by the Wrapper)
// -------------------------------------------------------------------------

    var REG = {
        ALL : 0,
        TEXT : 1,
        ESCAPE : 2,
        STATEMENT : 3,
        SCRIPT : 4,
        LAST : 5,
    };

    /**
     * This function helps getting the header of a statement. See the catch of
     * the statements in parseFragment function to see it in use. Note this
     * function does not change the tree.
     * @param  {String} template That template in parseToTree.
     * @param  {Object} settings That settings in parseToTree.
     * @param  {Number} position The character position in template, when the level was increased.
     * @return {Object}          An object with the resulting text and the position in template where this function has stopped.
     */
    function parseStatementHeader(template, settings, position){
        // We must only take care of the parenthesis.
        var parenthesisCount = 1;
        var open = false;
        var value = '';

        // We'll run through all the template from the current position, finding
        // the first open parenthesis and that which pairs with the first one.
        var i;
        for(i=position; i<template.length; i++){
            // If we didn't find the first parenthesis yet, we must seek for it.
            // The first parenthesis start on "(", but before it must be nothing
            // but some space which is ignored by the trim. If there is some
            // character not ignored by the trim, it isn't a space and, by the
            // way, it will not lead to the parenthesis we are expecting. So,
            // break before waste more time.
            if (! open)
            {
                if (template.charAt(i) === '(')
                    open = true;
                else
                if (template.charAt(i).trim() !== '')
                    break;
                else
                    continue;
            } else
            // If we already have the first parenthesis, we must seek for that
            // which matches it. We should return and stop the function once we
            // found, because when the `for` loop ends, we are in trouble with
            // the end of the file.
            {
                if (template.charAt(i) === '(')
                    parenthesisCount++;
                else
                if (template.charAt(i) === ')')
                {
                    parenthesisCount--;
                    if (! parenthesisCount)
                        return {'text':value.trim(), 'position':i+1};
                }
                
                // Does not matter if the char is parenthesis or not, we add it.
                // The first open parenthesis is not in this "else" block, and
                // the final close parenthesis will return, so here are the
                // inner characters and inner parenthesis.
                value += template.charAt(i);
            }
        }

        // At end, we see if the parenthesis was open in the loop. If it was
        // open and the loop does not return, the parenthesis was never closed
        // before EOF. Otherwise, there were no parenthesis at all.
        if (open)
            throw new Error('Unclosed parenthesis after character '+position);
        return {'text':null,'position':position};
    }

    /**
     * This function helps to recursively get any block. It is called anytime
     * the tree enters one level, and returns when the level is finished.
     * @param  {String}  template That template in parseToTree.
     * @param  {Object}  settings That settings in parseToTree.
     * @param  {Object}  tree     The tree itself to return in parseToTree.
     * @param  {Number}  position The character position in template, when the level was increased.
     * @param  {String?} statType The statement type (as string) to know what kind of statement we are managing. Null for the main.
     * @return {Number}           The position in template where this function has stopped.
     * @memberOf DeveloperFuntions
     */
    function parseFragment(template, settings, tree, position, statType){
        // Let's start the regular expression to catch the nearest tag and some
        // text until that. The expression begins in the given position. 
        var m,mainExp = /([\s\S]*?)(?:\\(@\w|@|<\?)|@(if|for|while|elseif|else|end[A-Za-z]*)|(<\?=|<\?\s+)|([\s\S])$)/guy;
        mainExp.lastIndex = position;

        // We'll recursively get the next nearest tag, some text until find the
        // tag, and occasionally the end of the template string. It is natural
        // and expected, so the regular expression helps to the string until
        // end, if any.
        while(m = mainExp.exec(template))
        {
            // Simply add the captured text, if any!
            // Once it is short, we stacked the if-then, one per line.
            if (m[REG.TEXT] || m[REG.ESCAPE] || m[REG.LAST]) tree.ensureLast('text',{'value':''});
            if (m[REG.TEXT])   tree.last.value += m[REG.TEXT];
            if (m[REG.ESCAPE]) tree.last.value += m[REG.ESCAPE];
            if (m[REG.LAST])   tree.last.value += m[REG.LAST];
            // Break if it was the last. After break we take care of last steps.
            if (m[REG.LAST])   break;

            // Now you may have put a <? or <?= tag to complicate the things, so
            // we take care of them.
            if (m[REG.SCRIPT])
            {
                // Catch absolutely anything until ?>, as this pattern is not
                // commom in Javascript. The start must be in the current
                // position, and where it stops, we update the current.
                let g, groupExp = /([\s\S]*?)\?>/guy;
                groupExp.lastIndex = mainExp.lastIndex;
                g = groupExp.exec(template);
                if (! g)
                    throw new Error('Missing ?> tag to close '+m[REG.SCRIPT].trim());
                mainExp.lastIndex = groupExp.lastIndex;

                // Now we have something! We must add, but first we see if it
                // was a PRINT or SCRIPT tag. Only they can enter here, so, one
                // stacked "if" is sufficient.
                let type;
                if (m[REG.SCRIPT] === '<?=') type = 'print';
                else type = 'script';
                tree.add(type, {'value':String(g[1] || '').trim()})

                // Let stop here.
                continue;
            }

            // But maybe it was not a script tag, and not a text or escape, so
            // it must be a STATEMENT! We will now take care of a statament.
            if (m[REG.STATEMENT])
            {
                // A shorthand.
                let stat = m[REG.STATEMENT];

                // OK, so before continue, let's see if we are not dealing with
                // an "@end" to end a previously open statement.
                if (stat.startsWith('end'))
                {
                    // We cannot exit a block if we never had start that block
                    // before, right?
                    if (! statType)
                        throw new Error('An @'+stat+' was found without any open block, near of character '+mainExp.lastIndex);

                    // If we have an ending one, we must match it with the
                    // current open statType. It is the context where this
                    // function was called. Lazy people may end a tag with only
                    // @end, while applied people will end with the complete
                    // substantive: @endwhile, for example.
                    // To end a block, we just leave the tree node and return
                    // the position we are.
                    if (stat === 'end')
                    {
                        // Cannot end do..while with the short tag @end
                        if(statType === 'do')
                            throw new Error('Cannot end a @do block with single @end, instead, use @endwhile(...) to close it');
                        // @if/@elseif/@else has one more level to exist, the
                        // ifblock
                        if (['if','else','elseif'].indexOf(statType) >= 0)
                            tree.leave();
                        tree.leave();
                        return mainExp.lastIndex;
                    }

                    // We need to worry about the statType. We can be in an else
                    // or elseif block, but we are still expecting @endif.
                    // 
                    // Note if we find an "else" or "elseif", by the conditions
                    // imposed to start it, we are in a "if" (because "if" start
                    // and ifblock and else/elseif are only allowed in ifblock),
                    // so we need to leave these else[if] tag now to leave the
                    // ifblock after.
                    let realEnd = statType;
                    if (['if','else','elseif'].indexOf(statType) >= 0)
                    {
                        realEnd = 'if';
                        tree.leave();
                    } else

                    // If we are in a "do..while" statement, we not only must
                    // get an @endwhile instead of @enddo, but we need also get
                    // the expression to the "do" block.
                    // After it, we can end normally the block.
                    if (statType === 'do')
                    {
                        realEnd = 'while';
                        let header = parseStatementHeader(template,settings,mainExp.lastIndex);
                        mainExp.lastIndex = header.position;
                        tree.current.header = header.text;
                    }

                    // Let's see the good long form, @endif, @endwhile, which
                    // prevent us to mess with the blocks, closing an wrong one
                    // by mistake. If we get an ===, we don't need to worry.
                    if (stat.toLowerCase() !== 'end'+realEnd)
                        throw new Error('Expecting @end'+realEnd+', but @'+stat+' found near of character '+mainExp.lastIndex);

                    // Now we can safely close this block and return... but
                    // wait! Like before the "leave" may fail if we are in the
                    // root node.
                    tree.leave();
                    return mainExp.lastIndex;
                }

                // If the statement is an "if" block, we must group it to catch
                // any "elseif" and "else" statements too. This is not needed to
                // while and for, once they does not have a continuity like the
                // if-elseif-else set.
                if (stat === 'if')
                    tree.enter('ifblock',{});
                else
                // One more check: "else" and "elseif" are only allowed in
                // "ifblock" group, and they stop other if/elseif blocks.
                if (['else','elseif'].indexOf(stat) >= 0)
                {
                    if (tree.current.type !== 'ifblock')
                    {
                        if ((statType === 'if') || (statType === 'elseif'))
                            tree.leave();
                        else
                        if (statType === 'else')
                            throw new Error('Unexpected multiple @else statements (or @elseif after @else) in the same @if '+mainExp.lastIndex);
                        else
                            throw new Error('Unexpected @'+stat+' statement without matching @if (instead, it was in @'+statType+') at character '+mainExp.lastIndex);
                    }
                }

                // OK, before we continue to catch the possible (or not) header
                // and the children, we must see if we will in the fact enter
                // this tag to get some kids.
                // These next are the tags who have children.
                let hasChildren = false;
                if (['if','elseif','else','while','for','do'].indexOf(stat) >= 0)
                {
                    hasChildren = true;
                    tree.enter(stat,{});
                }

                // These next statements have an header, a parenthesis with
                // their conditions right after the tag. Let's see who are they?
                if (['if','elseif','while','for'].indexOf(stat) >= 0)
                {
                    let header = parseStatementHeader(template,settings,mainExp.lastIndex);
                    if (header.text === null)
                        throw new Error('Expecting ( at character '+mainExp.lastIndex);
                    mainExp.lastIndex = header.position;
                    tree.current.header = header.text;
                }

                // And the next statements, with or without header, will need to
                // consume a block of children items until "@end". Rembember we
                // entered the tree before, so let's just catch'em all!
                if (hasChildren)
                {
                    mainExp.lastIndex = parseFragment(template, settings, tree, mainExp.lastIndex, stat);
                    // The if will not tolerate to be unclosed, but if, else and
                    // elseif automatically close each other. So, let's reply it
                    // to them.
                    if (['elseif','else'].indexOf(stat) >= 0)
                        return mainExp.lastIndex;
                }
                continue;
            }

            // There is no other block to expect, so, let's do all again...
            // continue;
        }

        // Wow! Are we done? I tought it would never end!
        // Now we must ensure we are in the main block, because if we were in
        // in a block, the @end would have exited of this function. But if we
        // are here, the file may have ended (by finding an end, or by failing
        // the expression). So, let's check if we are not on the main, the
        // untyped one.
        if (statType)
            throw new Error('Unclosed @'+statType+' at character '+mainExp.lastIndex);

        return mainExp.lastIndex;
    }

    /**
     * Parse a template string.
     * @param  {String} template This parameter is guaranteed to be a String, whose line breaks are \n and no \t is present. The string always ends with \n.
     * @param  {Object} settings This parameter is guaranteed to be an object with default fields of settings.
     * @return {Object}          Returns the tree. If can't return the tree, must throw an error.
     * @memberOf DeveloperFuntions
     */
    function parseToTree(template, settings){
        // Create the tree, call the fragment, ignore the position it ended,
        // return the tree. Pretty simple, uh?
        var tree = new Tree();
        parseFragment(template, settings, tree, 0, null);
        return tree;
    }

// -------------------------------------------------------------------------
// -- Functions to Build (called in chain by the Wrapper)
// -------------------------------------------------------------------------

    var vm = require('vm');
    function buildRunScript(script, context){
        return vm.runInContext(String(script), context);
    }

    function buildConditionally(buildInfo, tree, context, node){
        if (node.children.length <= 0)
            throw new Error('Invalid intermediate tree: the ifblock is empty');
        if (node.children[0].type !== 'if')
            throw new Error('Invalid intermediate tree: the ifblock must have an "if" as first child');

        for(var i in node.children)
        {
            if((node.children[i].type === 'else') || Boolean(buildRunScript(node.children[i].header,context)))
            {
                buildChildrenArray(buildInfo, tree,context,node.children[i].children);
                break;
            }
        }
    }

    function buildLooping(buildInfo, tree, context, node){
        var script;
        var maxIterations = 1000000;
        // We must build the script to run the for/while/do loop in the
        // sandboxed context. For that, we will write a script that runs the
        // loop and switch through the result to know if it must break,
        // continue, abort, or something like that. The __next_loop_step is the
        // function to call the next step on the current loop. It receives an
        // unique numeric identifier to know the loop is the current, and the
        // system is not being messed inside the script (calling
        // __next_loop_step) manually, for example. So, the generated script
        // seek for the __next_loop_step result. If false, the limit of loops
        // has expired and an error is thrown.
        // Each loop have a header and/or footer.
        // The loop control, and its ID are not available to the template
        // script. Instead, it is controlled here and only the ID value is
        // passed to that context.
        buildInfo.newIterator(node.children);
        switch(node.type){
            case 'for':
                script = 'for('+node.header+'/* */\n)';
                script += 'switch(__next_loop_step('+buildInfo.lastIterator().id+')){case "break":break;case "continue":continue;case false:throw new Error("Loop has exceeded the max limit of iterations");}';
                break;
            case 'while':
                script = 'while('+node.header+'/* */\n)';
                script += 'switch(__next_loop_step('+buildInfo.lastIterator().id+')){case "break":break;case "continue":continue;case false:throw new Error("Loop has exceeded the max limit of iterations");}';
                break;
            case 'do':
                script = 'do{'
                script += 'switch(__next_loop_step('+buildInfo.lastIterator().id+')){case "break":break;case "continue":continue;case false:throw new Error("Loop has exceeded the max limit of iterations");}';
                script += '}while('+node.header+'/* */\n);';
                break;
            default: throw new Error('Unexpected flow ['+node.type+']');
        }
        buildRunScript(script,context);
    }

    function buildChildrenArray(buildInfo, tree, context, children){
        for(var i in children)
        {
            buildFromNode(buildInfo, tree, context, children[i]);
        }
    }

    function buildFromNode(buildInfo, tree, context, node){
        switch (node.type){
            case 'ifblock':
                buildConditionally(buildInfo, tree, context, node);
                return;
            case 'do':
            case 'for':
            case 'while':
                buildLooping(buildInfo, tree, context, node);
                return;
            case 'text':
                buildInfo.content += node.value;
                return;
            case 'script':
            case 'print':
                var result = buildRunScript(node.value, context);
                if (node.type === 'print')
                    buildInfo.content += String(result);
                return;
            case 'tokens':
                break;
            case 'if':
            case 'else':
            case 'elseif':
                throw new Error('Invalid intermediate tree: invalid node ['+node.type+'] in this context');
            default:
                throw new Error('Invalid intermediate tree: no implementation for node ['+node.type+']');
        }

        if (node.children)
            buildChildrenArray(buildInfo, tree,context,node.children);
    }

    function buildFromTree(tree, sandbox){
        // Preapre the build info. It is the shared object that holds the
        // content and elements of the building flow.
        var buildInfo = {
            'iterators': [],
            'iterator_uuid': 0,
            'content': '',
            'newIterator': function(children){
                buildInfo.iterator_uuid++;
                var obj = {'id':buildInfo.iterator_uuid, 'count':0, 'children':children};
                buildInfo.iterators.push(obj);
            },
            'lastIterator': function(){ return buildInfo.iterators[buildInfo.iterators.length-1]; },
        }

        // Prepare the sandbox. The sandbox will have access to the engine
        // version and some helper methods.
        sandbox = sandbox || {};
        sandbox.__engine = __engine;
        sandbox.__next_loop_step = function(uuid){
            var last = buildInfo.lastIterator();
            if (last.id !== uuid)
                throw new Error('Access Violation: loop iterator out of order (expecting "'+last.id+'", received "'+uuid+'")');
            if (last.count >= 1000000)
                return false;
            var r = buildChildrenArray(buildInfo, tree, sandbox, last.children);
            last.count++;
            return r;
        };
        sandbox.print = function(text){ buildInfo.content += String(text); };
        sandbox.clear = function(text){ buildInfo.content = ''; };
        vm.createContext(sandbox);

        buildFromNode(buildInfo, tree, sandbox, tree.root);
        return String(buildInfo.content);
    }

// -------------------------------------------------------------------------
// -- Object Wrapper
// -------------------------------------------------------------------------
    
    /**
     * @name ZacTmpl
     * @class
     * Manage a template generating an intermediate tree, and converts the tree
     * to a plain text, preprocessing the embedded scripts in a sandboxed
     * context.
     */
    class Wrapper{
        /**
         * Create an instance to manage one template and related.
         * @param  {Object} settings Settings of the template engine, if any.
         */
        constructor(settings){
            this.settings = {};
            if (settings)
            {
                for (var i in settings)
                    this.settings[i] = settings[i];
            }
        }

        /**
         * This function parses a template string and generates the intermediate
         * tree. You must store the tree to build templates after.
         * @param  {String} template A string (or something that evalutes to String) of the template.
         * @return {ZacImplTree}     The intermediate tree of the compiled template.
         */
        compile(template){
            // We should prepare the string, replace line breaks, remove tabs
            // and add a \n at end.
            var s = String(template).replace(/\n\r?/g,'\n').replace(/\n$|$/,'\n').replace(/\t/g,'    ');
            // We will catch all blocks to the tree. The errors thrown obey the
            // rule where the "character \d+" inform the near of the error. You
            // can use a regular expression to replace this character info by
            // the line and column numbers. But you have to dig it by yourself.
            // 
            // The returning value is the tree itself.
            return parseToTree(s, this.settings);
        }

        /**
         * Make a text from the given intermediate tree using custom variables.
         * It is recommended to make a new object when passing to the sandbox,
         * as the object will suffer big changes during the process. The changes
         * you may expect to the sandbox object are:
         * 
         *  - conversion to node VM context.
         *  - custom fields added in the build process.
         *  - custom fields added by the template.
         *
         * Also, the template can access anything you give to it, including the
         * constructor and prototype object or fields (if any).
         *  
         * @param  {ZacTmplTree} tree    The intermediate tree.
         * @param  {Object}      sandbox An object to contextify and give to the template. It is recommended to be a new plain object.
         * @return {String}              The resulting text after preprocess the template, which may be an HTML or something like that.
         */
        make(tree, sandbox){
            return buildFromTree(tree, sandbox, this.settings);
        }
    }

// -------------------------------------------------------------------------
// -- Module Footer
// -------------------------------------------------------------------------

    if (typeof window !== 'undefined')
        window.ZacTmpl = Wrapper;
    if (typeof module !== 'undefined')
        module.exports = Wrapper;
    return Wrapper;

})();