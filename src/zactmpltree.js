var ZacTmplTree = (function(){
    /**
     * Tree for ZacTemplate. The tree allow operations like entering a node, exiting
     * a node, add child nodes.
     *
     * @property {Object} root       The raw tree structure. Do not modify it manually.
     * @property {Object} path       *Private*. Inform and control the path from the root to the current selected children.
     * @property {Object} current    *Read-only*. Returns the current selected node.
     * @property {Array}  children   *Read-only*. Returns the array of children of the current selected node.
     * @property {Object} last       *Read-only*. Returns the last child of the selected node.
     * @property {String} ELeaveRoot Custom error message to throw when try to leave the root node.
     */
    class ZacTmplTree
    {
        /**
         * Creates an empty tree.
         * @constructor
         */
        constructor(){
            this.root = {
                'type':'tokens',
                'root': true,
                'children':[],
            };
            this.path = [this.root];
            this.ELeaveRoot = null;
        }

        get current(){ return this.path[this.path.length-1]; }
        get children(){ return this.path[this.path.length-1].children; }
        get last(){ return this.children[this.children.length-1]; }

        /**
         * Leave the node and back to the parent.
         * @throws {Error} If called when the root node is the current. Cannot leave the root node.
         */
        leave(shouldThrow){
            if (this.path.length <= 1)
            {
                if (shouldThrow === false)
                    return false;
                throw new Error(this.ELeaveRoot || 'Cannot leave the root node');
            }
            this.path.pop();
            return true;
        }

        /**
         * Add a child node. Normally a leaf node without the field "children". The
         * node will receive the field "type" plus the given fields.
         * @param {String} type   Value of the node "type" field.
         * @param {Object} node   Must be a new object to be modified and added.
         */
        add(type,node){
            node.type = String(type);
            this.children.push(node);
        }

        /**
         * Verify is a node is of some specific type. If the node match the type,
         * the function terminates, otherwise, it will add the node.
         * @param {String} type   Value of the node "type" field.
         * @param {Object} node   Must be a new object to be modified and added.
         */
        ensureLast(type,node){
            if (! this.last || (this.last.type !== type))
                this.add(type, node);
        }

        /**
         * Add a child node, which will contain subnodes. The function will mark the
         * added object as selected, and next additions will occur in this added
         * object. The node will receive the fields "type" and "children".
         * @param {String} type   Value of the node "type" field.
         * @param {Object} node   Must be a new object to be modified and added.
         */
        enter(type,node){
            node.type = String(type);
            node.children = [];
            this.children.push(node);
            this.path.push(node);
        }

        /**
         * Return an indented string with the tree. The parameters are used for
         * recursive calls and may be safely ignored.
         * @return {String}   The string in a custom format easy to debug the tree.
         */
        treeToString(level=0,subitem){
            if (! subitem)
                subitem = this.root;
            var tab = '    '.repeat(level);
            var s = '['+(subitem.type || 'unknown')+']';
            if (subitem.header)
                s += ' ('+subitem.header+')';
            if (subitem.value)
                s += ': '+subitem.value.substr(0,40).replace(/\n/g,'·');

            if(subitem.children)
            {
                for(var i in subitem.children)
                    s += '\n'+this.treeToString(level+1, subitem.children[i]);
            }
            return tab + s;
        }
    }

    if(typeof window !== 'undefined')
        window.ZacTmplTree = ZacTmplTree;
    if(typeof module !== 'undefined')
        module.exports = ZacTmplTree;

    return ZacTmplTree;
})();