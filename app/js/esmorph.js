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

        children = object.myChildren || object.children;
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

    function createFunctionTree (object, code, functionTree, master, masterFunction) {
        var key, 
            child, 
            parent,
            parentFunction,
            path, 
            i, 
            functionObject;

        parent = (typeof master === 'undefined') ? [] : master;
        parentFunction = (masterFunction && !isEmpty(masterFunction)) ? masterFunction : functionTree;

        functionObject = createFunctionObject(object, parent[0], code);

        for (key in object) {
            if (object.hasOwnProperty(key)) {
                child = object[key];
                path = [ object ];
                path.push(parent);

                if (typeof child === 'object' && child !== null) {
                    if (!isEmpty(functionObject)) {
                        if (getNodeScope(parentFunction).concat(parentFunction.myChildren).indexOf(functionObject) < 0) {
                            functionObject.parent = parentFunction;
                            parentFunction.myChildren.push(functionObject);
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
            if(obj.hasOwnProperty(prop)) {
                return false;
            }
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

        functionTree = getFunctionTree(tree, code);
        functionTree = setFunctionTreeDependencies(functionTree);
        functionTree = addHiddenChildren(functionTree);
        console.log("functionTree!!!, ", functionTree);

        // // BUBBLE
        functionTree = convertToChildren(functionTree);
        makeBubbleChart(functionTree, code);

        return code;
    }


    function convertToChildren (functionTree) {
        var parent = functionTree;

        function traverseChild (parent) {
            var i, 
                childLength,
                child;

            //convert myChildren to children
            parent.children = parent.myChildren;
            //parent.size = parent.dependencies.length * 2 + 1;
            parent.size = parent.sourceCode ? (parent.sourceCode.length * 2 + 1) : 1;
            delete parent.myChildren;

            childLength = parent.children.length;
            for(i = 0; i < childLength; i++) {
                child = parent.children[i];
                traverseChild(child);
            }
        }
        traverseChild(parent);

        return functionTree;
    }

    function getSankeyData (functionTree) {
        var nodes = [],
            links = [];

        traverseFunctionTree(functionTree, function(node, path) {
            nodes.push(node);
            if (node && node.parent) {
                links.push({
                    source: node.parent,
                    target: node,
                    value: node.dependencies.length * 2 + 1
                });
            }
        });

        return {
            nodes: nodes,
            links: links
        }
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
            } else if (parent.type === Syntax.Property) {
                functionObject = {
                    name: parent.key ? parent.key.name : '[Anonymous]'
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
            functionObject.myChildren = [];
            functionObject.scopedList = [];
        }

        return functionObject;
    }

    //create tree of scoped functions
    function getFunctionTree (node, code, sourceCode) {
        //console.log("sourceCode in getFunctionTree: ", sourceCode);
        var functionTree = {
                name: sourceCode.name || 'noName',
                parent: null,
                myChildren: [],
                treeNode: node,
                type: sourceCode.type,
                sourceCode: sourceCode.code
            };
        createFunctionTree(node, code, functionTree);

        return functionTree;
    }

    //NOTE: node.scopedList will be a 2d array of nodes
    function setScopedList (functionTree) {
        traverseFunctionTree(functionTree, function(node, path) {
            if (!node.scopedList) {
                node.scopedList = [];
            }

            if (node.parent && node.parent.scopedList.length) {
                //TODO: should exclude anonymous functions from the lastscopedList block
                node.scopedList = node.parent.scopedList.concat([node.scopedList]);
            }
            node.scopedList.push(node.myChildren);  
        });
        return functionTree;
    }

    function setFunctionTreeDependencies (functionTree){
        traverseFunctionTree(functionTree, function (node, path) {
            var scopedList = [],
                parent = node,
                func,
                i,
                childLength = node.myChildren.length,
                flatScopedList;
            
            flatScopedList = node.scopedList.reduce(function(a, b) {
              return b.concat(a);
            });
            node.dependencies = getDependencies(node.treeNode, flatScopedList);

            for (i = 0; i < childLength; i++) {
                func = node.myChildren[i];
                if (func.name === "[Anonymous]"){
                    node.dependencies.push(func);
                }
            }
        });
        return functionTree;
    }

    //walk up the parents and add all their children
    function getNodeScope (node, scopeList) {
        scopeList = scopeList ? scopeList : [];

        if (node && node.parent) {
            scopeList = scopeList.concat(node.parent.myChildren);
            getNodeScope(node.parent, scopeList);
        }
        
        return scopeList;
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
                isAFunction = true;
            }           
            
            if (isAFunction && element.name) {
                funcIndex = scopedList.map(function (funcObject) {
                    return UTILS.getBaseName(funcObject);
                }).indexOf(UTILS.getBaseName(element));

                if (funcIndex >= 0) {
                    existingIndex = children.map(function (funcObject) {
                        return UTILS.getBaseName(funcObject);
                    }).indexOf(UTILS.getBaseName(element));

                    if (existingIndex === -1) {
                        children.push(scopedList[funcIndex]);
                    }
                }    
            }
        });

        return children;
    }

    function addHiddenChildren (functionTree) {
        traverseFunctionTree(functionTree, function(node, path) {
            if (node && node.myChildren && 
                node.myChildren.length === 1 && 
                (node.type !== 'file' || node.type !== 'inlineScript') &&
                node.myChildren[0].name !== '[Anonymous]'
            ) {
                node.myChildren.push({
                    name: '',
                    parent: node,
                    myChildren:[],
                    dependencies:[],
                    treeNode: null,
                    type: "hidden"
                });
            }
        });
        return functionTree;
    }

    function setUniqueIds (functionTree) {
        traverseFunctionTree(functionTree, function(node, path) {
            node.uniqueId = node.uniqueId || UTILS.getId(node.treeNode);
        });
        return functionTree;
    }

    function functionExists (name, functionList) {
        var index = functionList.map(function (node) {return node.name}).indexOf(name);
        if (index === -1 ) {
            return false;
        } else {
            return true;
        }
    }

    function initFunctionTree (sourceCode) {
        var tree,
            functionTree,
            code = sourceCode.code;

        tree = esprima.parse(code, { range: true, loc: true});

        functionTree = getFunctionTree(tree, code, sourceCode);
        functionTree = setFunctionTreeDependencies(functionTree);
        functionTree = addHiddenChildren(functionTree);
        functionTree = setUniqueIds(functionTree);
        functionTree = convertToChildren(functionTree);

        return functionTree;
    }

    function addFunctionTrace (code, codeTree) {
        var offset = 0, //adjust range to account for upstream insertions
            traceStartInsert;

        traverseFunctionTree(codeTree, function(node, path) {
            var start;

            if (node.type === 'file' || node.type === 'inlineScript') {
                return;
            }

            start = code.slice(node.treeNode.range[0] + offset).indexOf('{') + node.treeNode.range[0] + offset + 1;
            node.uniqueId = UTILS.getId(node.treeNode);
            traceStartInsert = ' postMessage({ type: "TARGET_PAGE", uniqueId: "'+ node.uniqueId +'", direction: "start"}, "*"); ';
            code = UTILS.spliceSlice(code, start, 0, traceStartInsert);
            offset += traceStartInsert.length;
        });

        //remove google api loading header
        if (code.slice(0, 50).indexOf('gapi.loaded') > -1) {
            console.log("removing google api loading header");

            code = code.replace(/gapi\.loaded(_\d+)?/, '');
        }

        //TODO: insert the traceEndInsert

        return code;
    }

    exports.Tracer = {
        init: init,
        functionTree: initFunctionTree,
        getFunctionTree: getFunctionTree,
        setScopedList: setScopedList,
        setFunctionTreeDependencies: setFunctionTreeDependencies,
        addHiddenChildren: addHiddenChildren,
        setUniqueIds: setUniqueIds,
        convertToChildren: convertToChildren,
        addFunctionTrace: addFunctionTrace
    };

}(typeof exports === 'undefined' ? (esmorph = {}) : exports));
