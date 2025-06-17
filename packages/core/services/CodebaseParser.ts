import { promises as fs } from 'fs';
import { join } from 'path';

import { injectable, inject } from 'tsyringe';
import * as ts from 'typescript';
import { z } from 'zod';

import type { Logger } from '../../ports/index.ts';
import {
  ParsedFileSchema,
  ClassDefinitionSchema,
  ExportStatementSchema,
  ParameterSchema,
  LocationSchema,
} from '../validators/CodebaseSchemaValidator.ts';

// Infer the type from the Zod schema to use it internally
type ParsedFile = z.infer<typeof ParsedFileSchema>;
type ClassDefinition = z.infer<typeof ClassDefinitionSchema>;
type ExportStatement = z.infer<typeof ExportStatementSchema>;
type Parameter = z.infer<typeof ParameterSchema>;
type Location = z.infer<typeof LocationSchema>;

@injectable()
export class CodebaseParser {
  private readonly logger: Logger;

  constructor(@inject('Logger') logger: unknown) {
    // Type guard to ensure logger implements the Logger interface
    if (!logger || typeof logger !== 'object') {
      throw new Error('Logger must be a valid object');
    }

    const loggerObj = logger as Record<string, unknown>;
    if (
      typeof loggerObj.debug !== 'function' ||
      typeof loggerObj.info !== 'function' ||
      typeof loggerObj.warn !== 'function' ||
      typeof loggerObj.error !== 'function'
    ) {
      throw new Error('Logger must implement all required methods');
    }

    this.logger = logger as Logger;
  }

  public async *parseStream(rootDir: string): AsyncGenerator<ParsedFile> {
    this.logger.info(`Starting codebase stream parse for root: ${rootDir}`);
    for await (const filePath of this._walk(rootDir)) {
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        yield this.parse(filePath, fileContent);
      } catch (error) {
        this.logger.error(`Failed to read or parse file: ${filePath}`, error as Error);
        // Optionally yield an error object or just skip the file
      }
    }

    this.logger.info(`Finished codebase stream parse for root: ${rootDir}`);
  }

  private async *_walk(dir: string): AsyncGenerator<string> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        yield* this._walk(fullPath);
      } else if (/\.(ts|js)$/.test(entry.name)) {
        yield fullPath;
      }
    }
  }

  public parse(filePath: string, fileContent: string): ParsedFile {
    this.logger.debug(`Starting parsing for file: ${filePath}`);

    const sourceFile = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.ESNext, true);

    // Create a program to get proper diagnostics
    const program = ts.createProgram(
      [filePath],
      {
        allowJs: true,
        checkJs: false,
        noEmit: true,
        target: ts.ScriptTarget.ESNext,
      },
      {
        getSourceFile: (fileName) => (fileName === filePath ? sourceFile : undefined),
        writeFile: () => {},
        getCurrentDirectory: () => '',
        getDirectories: () => [],
        fileExists: (fileName) => fileName === filePath,
        readFile: (fileName) => (fileName === filePath ? fileContent : undefined),
        getCanonicalFileName: (fileName) => fileName,
        useCaseSensitiveFileNames: () => true,
        getNewLine: () => '\n',
        getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
      },
    );

    const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile).map((diagnostic) => {
      const { line, character } = diagnostic.file
        ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!)
        : { line: 0, character: 0 };
      return {
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        file: diagnostic.file?.fileName,
        line: line + 1,
        character: character + 1,
      };
    });

    if (diagnostics.length > 0) {
      this.logger.warn(`TypeScript compiler diagnostics found for ${filePath}`, { diagnostics });
    }

    const definitions: ParsedFile['definitions'] = {
      functions: [],
      classes: [],
      variables: [],
    };
    const imports: ParsedFile['imports'] = [];
    const exports: ParsedFile['exports'] = [];

    const getLocation = (node: ts.Node): Location => {
      const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
      return {
        start: { line: start.line + 1, character: start.character + 1 },
        end: { line: end.line + 1, character: end.character + 1 },
      };
    };

    const extractMethodParameters = (node: ts.MethodDeclaration): Parameter[] => {
      return node.parameters.map((param) => ({
        name: param.name.getText(sourceFile),
        type: param.type?.getText(sourceFile),
        location: getLocation(param),
      }));
    };

    const visit = (node: ts.Node): void => {
      if (
        ts.isFunctionDeclaration(node) ||
        ts.isArrowFunction(node) ||
        ts.isFunctionExpression(node)
      ) {
        const functionName = ts.isFunctionDeclaration(node)
          ? node.name?.getText(sourceFile)
          : undefined;

        const parameters: Parameter[] = node.parameters.map((p) => ({
          name: p.name.getText(sourceFile),
          type: p.type?.getText(sourceFile),
          location: getLocation(p),
        }));

        definitions.functions.push({
          name: functionName,
          parameters,
          returnType: node.type?.getText(sourceFile),
          location: getLocation(node),
        });
      } else if (ts.isClassDeclaration(node)) {
        const className = node.name?.getText(sourceFile);
        if (className) {
          const classDef: ClassDefinition = {
            name: className,
            methods: [],
            properties: [],
            location: getLocation(node),
          };

          node.members.forEach((member) => {
            if (ts.isMethodDeclaration(member)) {
              const methodParameters = extractMethodParameters(member);
              classDef.methods.push({
                name: member.name.getText(sourceFile),
                parameters: methodParameters,
                returnType: member.type?.getText(sourceFile),
                location: getLocation(member),
              });
            } else if (ts.isPropertyDeclaration(member)) {
              classDef.properties.push({
                name: member.name.getText(sourceFile),
                type: member.type?.getText(sourceFile),
                location: getLocation(member),
              });
            }
          });
          definitions.classes.push(classDef);
        }
      } else if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach((declaration) => {
          if (ts.isIdentifier(declaration.name)) {
            definitions.variables.push({
              name: declaration.name.getText(sourceFile),
              type: declaration.type?.getText(sourceFile),
              location: getLocation(declaration),
            });
          }
        });
      } else if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
        const importClause = node.importClause;
        let defaultImport: string | undefined;
        const namedImports: string[] = [];

        if (importClause) {
          if (importClause.name) {
            defaultImport = importClause.name.getText(sourceFile);
          }
          if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
            importClause.namedBindings.elements.forEach((element) => {
              namedImports.push(element.name.getText(sourceFile));
            });
          }
        }

        imports.push({
          moduleSpecifier,
          namedImports,
          defaultImport,
          location: getLocation(node),
        });
      } else if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
        const exportStmt: ExportStatement = {
          namedExports: [],
          default: ts.isExportAssignment(node) && !node.isExportEquals,
          location: getLocation(node),
        };

        if (
          ts.isExportDeclaration(node) &&
          node.exportClause &&
          ts.isNamedExports(node.exportClause)
        ) {
          node.exportClause.elements.forEach((el) => {
            exportStmt.namedExports.push(el.name.getText(sourceFile));
          });
        }
        exports.push(exportStmt);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    this.logger.debug(`Finished parsing for file: ${filePath}`);

    const result: ParsedFile = {
      filePath,
      definitions,
      imports,
      exports,
      diagnostics,
      codeSnippet: fileContent.substring(0, 1000),
      startLine: 1,
      endLine: sourceFile.getLineAndCharacterOfPosition(sourceFile.getEnd()).line + 1,
    };

    const validationResult = ParsedFileSchema.safeParse(result);
    if (!validationResult.success) {
      this.logger.error(`Parsed output for ${filePath} failed validation`, validationResult.error);
      // In a real scenario, we might throw or return a structured error.
      // For now, we log it, and the consumer would receive a potentially invalid object.
    }

    return result;
  }
}
