(function (exports) {
    'use strict';

    var Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };

    // Executes visitor on the object and its children (recursively).

    function traverse(object, visitor, master) {
        var key, child, parent, path;

        parent = (typeof master === 'undefined') ? [] : master;

        if (visitor.call(null, object, parent) === false) {
            return;
        }

        for (key in object) {
            if (object.hasOwnProperty(key)) {
                child = object[key];
                path = [ object ];
                path.push(parent);
                if (typeof child === 'object' && child !== null) {
                    traverse(child, visitor, path);
                }
            }
        }
    }

    function traverseFunctionTree(object, visitor, master) {
        var key, child, parent, path, i, children, childrenLength;

        parent = (typeof master === 'undefined') ? [] : master;

        if (visitor.call(null, object, parent) === false) {
            return;
        }

        children = object.children;
        childrenLength = children.length;
        for(i = 0; i < childrenLength; i++) {
            child = children[i];
            path = [object];
            path.push(parent);
            if (typeof child === 'object' && child !== null) {
                traverseFunctionTree(child, visitor, path);
            }
        }
    }







    //function tree should be passed in as: {name: 'root', children: []}
    function createFunctionTree (object, code, functionTree, master, masterFunction) {
        var key, 
            child, 
            parent,
            parentFunction,
            path, 
            i, 
            functionObject;

        //parent = (typeof master === 'undefined') ? [] : master;
        parent = (typeof master === 'undefined') ? [] : master;
        parentFunction = (masterFunction && !isEmpty(masterFunction)) ? masterFunction : functionTree;



        // if (visitor.call(null, object, parent) === false) {
        //     return;
        // }

        //this could be in visitor function
        functionObject = createFunctionObject(object, parent[0], code);
        

        for (key in object) {
            if (object.hasOwnProperty(key)) {
                child = object[key];
                path = [ object ];
                path.push(parent);

                if (typeof child === 'object' && child !== null) {
                    if (!isEmpty(functionObject)) {
                        if (getNodeScope(parentFunction).concat(parentFunction.children).indexOf(functionObject) < 0) {
                            functionObject.parent = parentFunction;
                            parentFunction.children.push(functionObject);
                        }
                        createFunctionTree(child, code, functionTree, path, functionObject);
                    } else {
                        createFunctionTree(child, code, functionTree, path, parentFunction);
                    }
                }
            }
        }
    }

    function isEmpty(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }

        return true;
    }

    function init (code) {
        var tree,
            functionList,
            functionTree,
            param,
            signature,
            pos,
            i,
            formattedList;


        tree = esprima.parse(code, { range: true, loc: true});
        console.log("esprima tree: ", tree);

        //init function tree
        functionTree = getFunctionTree(tree, code);
        functionTree = setFunctionTreeDependencies(functionTree);
        console.log("functionTree!!!, ", functionTree);

        functionList = getFunctionList(tree, code);
        functionList = setParentFunctions(functionList);
        functionList = setScopedFunctionList(functionList);
        functionList = setDependencies(functionList);



        formattedList = {
            name: '',
            dependencies: getScopedFunctionList(null, functionList).map(function(ele) {
                return {
                    name: ele.name === '[Anonymous]' ? '' : ele.name,
                    dependencies: ele.dependencies
                };
            })
        };

        //remove root node if there is only one dependency.
        if (formattedList.dependencies.length === 1) {
            formattedList = formattedList.dependencies[0];
        }
        
        makeTree(formattedList);

        
        console.log("functionList: ", functionList);
        console.log("formatted list: ", formattedList);

        return code;
    }

    function getFunctionList (node, code) {
        var functionList = [];

        traverse(node, function (node, path) {
            var parent = (path && path[0]) ? path[0] : {},
                functionObject = createFunctionObject(node, path[0], code);

            if (!isEmpty(functionObject)) {
                functionList.push(functionObject);
            }
            
        });

        return functionList;
    }

    function createFunctionObject(node, parent, code) {
        var functionObject = {};

        if (node.type === Syntax.FunctionDeclaration) {
            functionObject = {
                name: node.id.name
            };
        } else if (parent && node.type === Syntax.FunctionExpression) {
            if (parent.type === Syntax.AssignmentExpression) {
                if (typeof parent.left.range !== 'undefined') {
                    functionObject = {
                        name: code.slice(parent.left.range[0], parent.left.range[1]).replace(/"/g, '\\"')
                    };
                }
            } else if (parent.type === Syntax.VariableDeclarator) {
                functionObject = {
                    name: parent.id.name
                };
            } else if (parent.type === Syntax.CallExpression) {
                functionObject = {
                    name: parent.id ? parent.id.name : '[Anonymous]'
                };
            } else if (typeof parent.length === 'number') {
                functionObject = {
                    name: parent.id ? parent.id.name : '[Anonymous]'
                };
            } else if (typeof parent.key !== 'undefined') {
                if (parent.key.type === 'Identifier') {
                    if (parent.value === node && parent.key.name) {
                        functionObject = {
                            name: parent.key.name
                        };
                    }
                }
            }
        }

        if (!isEmpty(functionObject)) {
            functionObject.range = node.range;
            functionObject.loc = node.loc;
            functionObject.blockStart = node.body.range[0];
            functionObject.treeNode = node;
            functionObject.dependencies = [];
            functionObject.children = [];
        }

        return functionObject;
    }

    //TODO: replace func with new Func constructor
    // function Func (func) {
    //     func.parent = functionParent;
    //     func.children = [];
    //     func.dependencies = [];
    //     func.treeNode = node;

    //     return func;
    // }

    //create tree of scoped functions
    function getFunctionTree (node, code) {
        var functionTree = {
                name: 'root',
                parent: null,
                children: [],
                treeNode: node
            };
        createFunctionTree(node, code, functionTree);

        return functionTree;
    }

    function setFunctionTreeDependencies (functionTree){
        traverseFunctionTree(functionTree, function (node, path) {
            var scopedList = [];
                parent = node;

            if (!node.parent) {

            }
            while (parent) {
                if (parent && parent.children) {
                    scopedList = scopedList.concat(parent.children);
                }
                parent = parent.parent;
            }
            node.dependencies = getDependencies(node.treeNode, scopedList);
        });
        return functionTree;
    }



    function getFunctionParent (path) {
        var i,
            pathLength = path.length,
            node;

        for (i = 0; i < pathLength; i++ ) {
            node = path[i];

            if (node.type === Syntax.FunctionDeclaration) {
                return node;

            } else if (node.type === Syntax.FunctionExpression) {
                parent = path[0];
                if (parent.type === Syntax.AssignmentExpression) {
                    if (typeof parent.left.range !== 'undefined') {
                        return node;
                    }
                } else if (parent.type === Syntax.VariableDeclarator) {
                    return node;
                } else if (parent.type === Syntax.CallExpression) {
                    return node;
                } else if (typeof parent.length === 'number') {
                    return node;
                } else if (typeof parent.key !== 'undefined') {
                    if (parent.key.type === 'Identifier') {
                        if (parent.value === node && parent.key.name) {
                            return node;
                        }
                    }
                }

            }
        }
    }
    
    function setParentFunctions (functionList) {
        var i,
            j, 
            listLength = functionList.length,
            node,
            temp,
            best = null;

        for(i = 0; i < listLength; i++ ) {
            node = functionList[i];
            best = null;

            //set parent of node as the most tightly wrapped node
            for (j = 0; j < listLength; j++ ) {
                if (j === i ) {
                    continue;
                }
                temp = functionList[j];
                    
                //only consider temp functions which wrap around the node function
                if (temp.range[0] <= node.range[0] && temp.range[1] >= node.range[1]) {
                    //init
                    if (!best) {
                        best = temp;
                        continue;
                    }

                    //find tightest wrapped parent
                    if (temp.range[0] >= best.range[0] && temp.range[1] <= best.range[1]) {
                        best = temp;
                    }
                }
            }

            node.myParent = best;
        }

        return functionList;
    }

    //walk up the parents and add all their children
    function getNodeScope (node, scopeList) {
        scopeList = scopeList ? scopeList : [];

        if (node && node.parent) {
            scopeList = scopeList.concat(node.parent.children);
            getNodeScope(node.parent, scopeList);
        }
        
        return scopeList;
    }


    //this should call itself with its parent node until it is null
    function getScopedFunctionList (node, functionList, originalNode) {
        var children = [],
            i,
            listLength = functionList.length,
            func;

        originalNode = originalNode ? originalNode : node;

        // if (node.name === '[Anonymous]') {
        //     return [node.myParent];
        // }
        for(i = 0; i < listLength; i++ ){
            func = functionList[i];

            //anonymouse functions can only be called by their parent
            if (func.name === '[Anonymous]' && func.myParent !== originalNode) {
                continue;
            }

            if (func.myParent === node) {
                children.push(func);
            }
        }
        if (node) {
            //recurs
            children = children.concat(getScopedFunctionList(node.myParent, functionList, originalNode));
        }

        return children;
    }

    function setScopedFunctionList (functionList) {
        var i,
            listLength = functionList.length,
            node;

        for (i = 0; i < listLength; i++) {
            node = functionList[i];
            node.scopedFunctions = getScopedFunctionList(node, functionList);
        }

        return functionList;
    }

    // function modify(code, modifiers) {
    //     var i;

    //     if (Object.prototype.toString.call(modifiers) === '[object Array]') {
    //         for (i = 0; i < modifiers.length; i += 1) {
    //             code = modifiers[i].call(null, code);
    //         }
    //     } else if (typeof modifiers === 'function') {
    //         code = modifiers.call(null, code);
    //     } else {
    //         throw new Error('Wrong use of esmorph.modify() function');
    //     }

    //     return code;
    // }

    function setDependencies (functionList) {
        var i,
            listLength = functionList.length;

        //find dependencies for one functionObj at a time
        for(i = 0; i < listLength; i++) {
            var func = functionList[i],
                node = func.treeNode,
                scopedList = func.scopedFunctions;

            // console.log("functionList: ", functionList, ", length = ", functionList.length);
            //console.log("scopedList: ", scopedList.map(function(x){return x.name}), ", node = ", func.name);

            func.dependencies = getDependencies(node, scopedList);
        }

        return functionList;
    }

    function getDependencies (node, scopedList) {
        var children = [];


        traverse(node, function (element, path) {
            var funcIndex,
                existingIndex,
                parent = path[0],
                isAFunction = false;

            if (parent === node) {
                return;
            }


            if (parent && parent.type === Syntax.CallExpression) {
                isAFunction = true;
            } else if (parent && parent.property === element) {
                

                //console.log("found a parent property");
                isAFunction = true;
            }           
            
            if (isAFunction && element.name) {
                funcIndex = scopedList.map(function (funcObject) {
                    return getBaseName(funcObject);
                }).indexOf(getBaseName(element));

                //console.log("element: ", element.name ,", scopedList: ", scopedList.map(function(x) {return x.name}), ", funcIndex: ", funcIndex);

                if (funcIndex >= 0) {
                    existingIndex = children.map(function (funcObject) {
                        return getBaseName(funcObject);
                    }).indexOf(getBaseName(element));

                    //console.log("element: ", element ,", scopedList: ", scopedList.map(function(node) {return node.name}), ", funcIndex: ", funcIndex, ", existingIndex: ", existingIndex, ", element.type: ", element.type);

                    if (existingIndex === -1) {
                        //console.log("adding to children");

                        children.push(scopedList[funcIndex]);
                    }
                }    
            }
        });

        return children;
    }

    //get id by stringifyting the unique range
    function getId (functionObject) {
        var range = functionObject.range;
        return range[0].toString() + "-" + range[1].toString();
    }

    function getBaseName (functionObject) {
        var name = functionObject.name,
            namePath;

        if (functionObject && name){
            namePath = name.split('.');
            //console.log("name: ", name, ", baseName: ", namePath[namePath.length - 1]);
            
            return namePath[namePath.length - 1];
        } else {

        }
    }

    function functionExists (name, functionList) {
        var index = functionList.map(function (node) {return node.name}).indexOf(name);
        if (index === -1 ) {
            return false;
        } else {
            return true;
        }
    }

    exports.Tracer = {
        init: init
        //FunctionEntrance: traceFunctionEntrance
    };

}(typeof exports === 'undefined' ? (esmorph = {}) : exports));
