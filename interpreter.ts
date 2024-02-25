/// <reference path="interpreter.d.ts"/>



function createLexer(text: string): Lexer
{
  return { text, pos: 0, currentChar: text[0]};
}

function advance(lexer: Lexer): void
{
  lexer.pos++;
  if ( lexer.pos < lexer.text.length ) 
  {
    lexer.currentChar = lexer.text[lexer.pos];
  }
  else
  {
    lexer.currentChar = null;
  }
}

function skipWhitespace(lexer: Lexer): void
{
  while ( lexer.currentChar !== null && /\s/.test(lexer.currentChar))
  {
    advance(lexer);
  }
}

function integer(lexer: Lexer): string
{
  let result = '';
  while (lexer.currentChar !== null && /\d/.test(lexer.currentChar)) 
  {
    result += lexer.currentChar;
    advance(lexer);
  }
  return result;
}

function getNextToken(lexer: Lexer): Token
{
  while ( lexer.currentChar !== null )
  {
    if (/\s/.test(lexer.currentChar))
    {
      skipWhitespace(lexer);
      continue;
    }
    if (/\d/.test(lexer.currentChar))
    {
      return { type: 'Number', value: integer(lexer)}
    }

    switch(lexer.currentChar)
    {
      case '+':
        advance(lexer);
        return { type: 'Plus'};
      case '-':
        advance(lexer);
        return { type: 'Minus'};
      case '*':
        advance(lexer)
        return { type: 'Multiply'};
      case '/':
        advance(lexer);
        return { type: 'Divide' };
      case '(':
        advance(lexer);
        return { type: 'LParen'};
      case ')':
        advance(lexer);
        return { type: 'RParen'};
      default:
        return {type: 'ERROR'};
    }

  }

  return { type: 'EOF'};
}

function createParser(lexer: Lexer): Parser
{
  const currentToken = getNextToken(lexer);
  return { lexer, currentToken };
}

function error(): never {
  throw new Error("Invalid syntax");
}

function createInterpreter(parser: Parser): Interpreter
{
  return { parser };
}

function eat(parser: Parser, tokenType: TokenType): void
{
  if ( parser.currentToken.type === tokenType)
  {
    parser.currentToken = getNextToken(parser.lexer);
    //console.log(parser.currentToken);
  }
  else
   error();
}

function factor(parser: Parser): ASTNode
{
  const token = parser.currentToken;
  if ( token.type === 'Number' )
  {
    eat(parser, 'Number');
    return { type: 'NumNode', token };
  }
  else if ( token.type === 'LParen')
  {
    eat(parser, 'LParen');
    const node = expr(parser);
    eat(parser, 'RParen');
    return node;
  }
  else
  {
    error();
  }
}

function term(parser: Parser): ASTNode
{
  let node = factor(parser);

  while ( ['Multiply', 'Divide'].includes(parser.currentToken.type as TokenType))
  {
    const op = parser.currentToken;
    if (op.type === 'Multiply')
    {
      eat(parser, 'Multiply');
    }
    else if ( op.type === 'Divide')
    {
      eat(parser, 'Divide');
    }
    node = { type: "BinOpNode", left: node, op, right: factor(parser)};
  }

  return node;
}
function expr(parser: Parser): ASTNode
{
  let node = term(parser);


  while ( ['Plus', 'Minus'].includes(parser.currentToken.type as TokenType) )
  {
    const op = parser.currentToken;
    if (op.type === 'Plus')
    {
      eat(parser, 'Plus');
    }
    else if ( op.type === 'Minus')
    {
      eat(parser, 'Minus');
    }
    node = { type: "BinOpNode", left: node, op, right: term(parser)};    
  }

  return node;
}


function visit(node: ASTNode): number
{
  if (node.type === 'NumNode')
  {
    return parseInt(node.token.value!);
  }
  else if ( node.type === 'BinOpNode' )
  {
    switch(node.op.type)
    {
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
};

function interpret(interpreter: Interpreter): number
{
  const { parser } = interpreter;
  const tree = expr(parser);
  console.log(tree);
  return visit(tree);
}

function isEOF(parser: Parser): boolean {
  return parser.currentToken.type === 'EOF';
}

function checkEOF(parser: Parser): void {
  if (!isEOF(parser)) {
      throw new Error('Unexpected tokens remaining.');
  }
}

function evaluateExpressions(expressions: string[]): string[]
{
  const results: string[] = [];
  for ( const expression of expressions)
  {
    try
    {
      const lexer = createLexer(expression);
      const parser = createParser(lexer);
      //console.log(parser);
      const interpreter = createInterpreter(parser);
      //console.log(interpreter);
      const result = interpret(interpreter).toString();
      checkEOF(parser);
      results.push(result)
    }
    catch (error)
    {
      results.push('ERROR');
    }
  }
  return results;
}


const expressions: string[] = [
  "10 / 2 - 1 ) "
];



const results: string[] = evaluateExpressions(expressions);
console.log(results);