
var formattedList;

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

                //console.log("Object: ", object, ", parent: ", parent);

                path.push(parent);
                if (typeof child === 'object' && child !== null) {
                    //console.log("parent: ", object);
                    //child.myParent = object.id;
                    traverse(child, visitor, path);
                }
            }
        }


    }


    function traceFunctionEntrance(traceName) {

        return function (code) {
            var tree,
                functionList,
                param,
                signature,
                pos,
                i,
                d3Root;


            tree = esprima.parse(code, { range: true, loc: true});

            functionList = getFunctionList(tree, code);
            functionList = setDependencies(functionList);

            formattedList = {
                    name: '',
                    dependencies: functionList.map(function(ele) {
                        return {
                            name: ele.name === '[Anonymous]' ? '' : ele.name,
                            dependencies: ele.dependencies
                        }
                    })
                };

            
            makeTree(formattedList);

            console.log("esprima tree: ", tree);
            console.log("functionList: ", functionList);
            console.log("formatted list: ", formattedList);

            return code;
        };
    }

    function getFunctionList (node, code) {
        var functionList = [];


        traverse(node, function (node, path) {
            var parent;

            if (node.type === Syntax.FunctionDeclaration) {
                functionList.push({
                    name: node.id.name,
                    range: node.range,
                    loc: node.loc,
                    blockStart: node.body.range[0],
                    treeNode: node,
                    dependencies: []
                });
            } else if (node.type === Syntax.FunctionExpression) {
                parent = path[0];
                if (parent.type === Syntax.AssignmentExpression) {
                    if (typeof parent.left.range !== 'undefined') {
                        functionList.push({
                            name: code.slice(parent.left.range[0],
                                      parent.left.range[1]).replace(/"/g, '\\"'),
                            range: node.range,
                            loc: node.loc,
                            blockStart: node.body.range[0],
                            treeNode: node,
                            dependencies: []
                        });
                    }
                } else if (parent.type === Syntax.VariableDeclarator) {
                    functionList.push({
                        name: parent.id.name,
                        range: node.range,
                        loc: node.loc,
                        blockStart: node.body.range[0],
                        treeNode: node,
                        dependencies: []
                    });
                } else if (parent.type === Syntax.CallExpression) {
                    functionList.push({
                        name: parent.id ? parent.id.name : '[Anonymous]',
                        range: node.range,
                        loc: node.loc,
                        blockStart: node.body.range[0],
                        treeNode: node,
                        dependencies: []
                    });
                } else if (typeof parent.length === 'number') {
                    functionList.push({
                        name: parent.id ? parent.id.name : '[Anonymous]',
                        range: node.range,
                        loc: node.loc,
                        blockStart: node.body.range[0],
                        treeNode: node,
                        dependencies: []
                    });
                } else if (typeof parent.key !== 'undefined') {
                    if (parent.key.type === 'Identifier') {
                        if (parent.value === node && parent.key.name) {
                            functionList.push({
                                name: parent.key.name,
                                range: node.range,
                                loc: node.loc,
                                blockStart: node.body.range[0],
                                treeNode: node,
                                dependencies: []
                            });
                        }
                    }
                }
            }
        });

        return setParentFunctions(functionList);
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


    //this should call itself with its parent node until it is null
    function getScopedFunctionList (node, functionList) {
        var children = [],
            i,
            listLength = functionList.length,
            func;

        for(i = 0; i < listLength; i++ ){
            func = functionList[i];
            if (func.myParent === node) {
                children.push(func);
            }
        }
        if (node) {
            //recurs
            children = children.concat(getScopedFunctionList(node.myParent, functionList));
        }

        return children;
    }

    function modify(code, modifiers) {
        var i;

        if (Object.prototype.toString.call(modifiers) === '[object Array]') {
            for (i = 0; i < modifiers.length; i += 1) {
                code = modifiers[i].call(null, code);
            }
        } else if (typeof modifiers === 'function') {
            code = modifiers.call(null, code);
        } else {
            throw new Error('Wrong use of esmorph.modify() function');
        }

        return code;
    }

    function setDependencies (functionList) {
        var i,
            listLength = functionList.length;

        //find dependencies for one functionObj at a time
        for(i = 0; i < listLength; i++) {
            var func = functionList[i],
                node = func.treeNode,
                scopedList = getScopedFunctionList(func, functionList);

            // console.log("functionList: ", functionList, ", length = ", functionList.length);
            //console.log("scopedList: ", scopedList.map(function(x){return x.name}), ", node = ", func.name);

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
                
                //test
                if (getBaseName(element) == 'swap'){
                    console.log("found the swap property function!");
                    console.log("element: ", element);

                }                
                
                if (isAFunction && element.name) {
                    funcIndex = scopedList.map(function (funcObject) {
                        return getBaseName(funcObject);
                    }).indexOf(getBaseName(element));

                    //console.log("element: ", element.name ,", scopedList: ", scopedList.map(function(x) {return x.name}), ", funcIndex: ", funcIndex);

                    if (funcIndex >= 0) {
                        existingIndex = func.dependencies.map(function (funcObject) {
                            return getBaseName(funcObject);
                        }).indexOf(getBaseName(element));

                        //console.log("element: ", element ,", scopedList: ", scopedList.map(function(node) {return node.name}), ", funcIndex: ", funcIndex, ", existingIndex: ", existingIndex, ", element.type: ", element.type);

                        if (existingIndex === -1) {
                            //console.log("adding to children");

                            func.dependencies.push(scopedList[funcIndex]);
                        }
                    }    
                }
            });
        }

        return functionList;
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

    //old
    exports.modify = modify;

    exports.Tracer = {
        FunctionEntrance: traceFunctionEntrance
    };

}(typeof exports === 'undefined' ? (esmorph = {}) : exports));
