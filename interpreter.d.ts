type TokenType = 
  | 'Number'
  | 'Plus'
  | 'Minus'
  | 'Multiply'
  | 'Divide'
  | 'LParen'
  | 'RParen'
  | 'EOF'
  | 'ERROR';

type Token = { type: TokenType; value?: string };

type NumNode = { type: 'NumNode', token: Token };

type BinOpNode = { type: 'BinOpNode'; left: ASTNode; op: Token; right: ASTNode };

type ASTNode = NumNode | BinOpNode;

type Lexer = { text: string; pos: number; currentChar: string | null };

type Parser = { lexer: Lexer; currentToken: Token };

type Interpreter = { parser: Parser };
