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

        children = object.myChildren;
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
                        if (getNodeScope(parentFunction).concat(parentFunction.myChildren).indexOf(functionObject) < 0) {
                            functionObject.parent = parentFunction;
                            parentFunction.myChildren.push(functionObject);
                            // console.log("functionTree: ", functionTree);
                            // console.log("parent: ", parentFunction);
                            // console.log("adding: ", functionObject);
                            // console.log("to children: ", parentFunction.children);
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

        // TREE
        //makeTree(functionTree);

        // BUBBLE
        functionTree = convertToChildren(functionTree);
        makeBubbleChart(functionTree);

        // SANKEY
        //var sankeyData = getSankeyData(functionTree);
        // console.log("sankeyData: ", sankeyData);
        // makeSankeyPlot(sankeyData);

        // functionList = getFunctionList(tree, code);
        // functionList = setParentFunctions(functionList);
        // functionList = setScopedFunctionList(functionList);
        // functionList = setDependencies(functionList);



        // formattedList = {
        //     name: '',
        //     dependencies: getScopedFunctionList(null, functionList).map(function(ele) {
        //         return {
        //             name: ele.name === '[Anonymous]' ? '' : ele.name,
        //             dependencies: ele.dependencies
        //         };
        //     })
        // };

        // //remove root node if there is only one dependency.
        // if (formattedList.dependencies.length === 1) {
        //     formattedList = formattedList.dependencies[0];
        // }
        
        // //makeTree(formattedList);

        
        // console.log("functionList: ", functionList);
        // console.log("formatted list: ", formattedList);

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
            parent.size = parent.dependencies.length * 2 + 1;
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
                myChildren: [],
                treeNode: node
            };
        createFunctionTree(node, code, functionTree);

        return functionTree;
    }

    function setFunctionTreeDependencies (functionTree){
        traverseFunctionTree(functionTree, function (node, path) {
            var scopedList = [],
                parent = node,
                func,
                i,
                childLength = node.myChildren.length;

            while (parent) {
                if (parent && parent.myChildren) {
                    scopedList = scopedList.concat(parent.myChildren);
                }
                parent = parent.parent;
            }
            node.dependencies = getDependencies(node.treeNode, scopedList);

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
