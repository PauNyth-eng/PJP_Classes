/// <reference path="interpreter.d.ts"/>
function createLexer(text) {
    return { text: text, pos: 0, currentChar: text[0] };
}
function advance(lexer) {
    lexer.pos++;
    if (lexer.pos < lexer.text.length) {
        lexer.currentChar = lexer.text[lexer.pos];
    }
    else {
        lexer.currentChar = null;
    }
}
function skipWhitespace(lexer) {
    while (lexer.currentChar !== null && /\s/.test(lexer.currentChar)) {
        advance(lexer);
    }
}
function integer(lexer) {
    var result = '';
    while (lexer.currentChar !== null && /\d/.test(lexer.currentChar)) {
        result += lexer.currentChar;
        advance(lexer);
    }
    return result;
}
function getNextToken(lexer) {
    while (lexer.currentChar !== null) {
        if (/\s/.test(lexer.currentChar)) {
            skipWhitespace(lexer);
            continue;
        }
        if (/\d/.test(lexer.currentChar)) {
            return { type: 'Number', value: integer(lexer) };
        }
        switch (lexer.currentChar) {
            case '+':
                advance(lexer);
                return { type: 'Plus' };
            case '-':
                advance(lexer);
                return { type: 'Minus' };
            case '*':
                advance(lexer);
                return { type: 'Multiply' };
            case '/':
                advance(lexer);
                return { type: 'Divide' };
            case '(':
                advance(lexer);
                return { type: 'LParen' };
            case ')':
                advance(lexer);
                return { type: 'RParen' };
            default:
                return { type: 'ERROR' };
        }
    }
    return { type: 'EOF' };
}
function createParser(lexer) {
    var currentToken = getNextToken(lexer);
    return { lexer: lexer, currentToken: currentToken };
}
function error() {
    throw new Error("Invalid syntax");
}
function createInterpreter(parser) {
    return { parser: parser };
}
function eat(parser, tokenType) {
    if (parser.currentToken.type === tokenType) {
        parser.currentToken = getNextToken(parser.lexer);
        //console.log(parser.currentToken);
    }
    else
        error();
}
function factor(parser) {
    var token = parser.currentToken;
    if (token.type === 'Number') {
        eat(parser, 'Number');
        return { type: 'NumNode', token: token };
    }
    else if (token.type === 'LParen') {
        eat(parser, 'LParen');
        var node = expr(parser);
        eat(parser, 'RParen');
        return node;
    }
    else {
        error();
    }
}
function term(parser) {
    var node = factor(parser);
    while (['Multiply', 'Divide'].includes(parser.currentToken.type)) {
        var op = parser.currentToken;
        if (op.type === 'Multiply') {
            eat(parser, 'Multiply');
        }
        else if (op.type === 'Divide') {
            eat(parser, 'Divide');
        }
        node = { type: "BinOpNode", left: node, op: op, right: factor(parser) };
    }
    return node;
}
function expr(parser) {
    var node = term(parser);
    while (['Plus', 'Minus'].includes(parser.currentToken.type)) {
        var op = parser.currentToken;
        if (op.type === 'Plus') {
            eat(parser, 'Plus');
        }
        else if (op.type === 'Minus') {
            eat(parser, 'Minus');
        }
        node = { type: "BinOpNode", left: node, op: op, right: term(parser) };
    }
    return node;
}
function visit(node) {
    if (node.type === 'NumNode') {
        return parseInt(node.token.value);
    }
    else if (node.type === 'BinOpNode') {
        switch (node.op.type) {
            case 'Plus':
                return visit(node.left) + visit(node.right);
            case 'Minus':
                return visit(node.left) - visit(node.right);
            case 'Multiply':
                return visit(node.left) * visit(node.right);
            case 'Divide':
                return visit(node.left) / visit(node.right);
            default:
                error();
        }
    }
    else
        error();
}
;
function interpret(interpreter) {
    var parser = interpreter.parser;
    var tree = expr(parser);
    console.log(tree);
    return visit(tree);
}
function isEOF(parser) {
    return parser.currentToken.type === 'EOF';
}
function checkEOF(parser) {
    if (!isEOF(parser)) {
        throw new Error('Unexpected tokens remaining.');
    }
}
function evaluateExpressions(expressions) {
    var results = [];
    for (var _i = 0, expressions_1 = expressions; _i < expressions_1.length; _i++) {
        var expression = expressions_1[_i];
        try {
            var lexer = createLexer(expression);
            var parser = createParser(lexer);
            //console.log(parser);
            var interpreter = createInterpreter(parser);
            //console.log(interpreter);
            var result = interpret(interpreter).toString();
            checkEOF(parser);
            results.push(result);
        }
        catch (error) {
            results.push('ERROR');
        }
    }
    return results;
}
var expressions = [
    "10 / 2 - 1 ) "
];
var results = evaluateExpressions(expressions);
console.log(results);
