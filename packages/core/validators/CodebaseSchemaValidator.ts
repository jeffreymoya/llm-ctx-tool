import { z } from 'zod';

// Versioning the schema contract
const schemaVersion = '2.0.0';

// Base position and location for AST nodes
const PositionSchema = z.object({
  line: z.number(),
  character: z.number(),
});

export const LocationSchema = z.object({
  start: PositionSchema,
  end: PositionSchema,
});

// Detailed schema for function parameters
export const ParameterSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  location: LocationSchema,
});

// Detailed schema for various kinds of definitions
export const FunctionDefinitionSchema = z.object({
  name: z.string().optional(), // For anonymous/arrow functions
  parameters: z.array(ParameterSchema),
  returnType: z.string().optional(),
  location: LocationSchema,
});

export const ClassDefinitionSchema = z.object({
  name: z.string(),
  methods: z.array(FunctionDefinitionSchema),
  properties: z.array(
    z.object({
      name: z.string(),
      type: z.string().optional(),
      location: LocationSchema,
    }),
  ),
  location: LocationSchema,
});

export const VariableDefinitionSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  location: LocationSchema,
});

export const ImportStatementSchema = z.object({
  moduleSpecifier: z.string(),
  namedImports: z.array(z.string()),
  defaultImport: z.string().optional(),
  location: LocationSchema,
});

export const ExportStatementSchema = z.object({
  namedExports: z.array(z.string()),
  default: z.boolean(),
  location: LocationSchema,
});

// Schema for compiler diagnostics (errors/warnings)
const DiagnosticSchema = z.object({
  message: z.string(),
  file: z.string().optional(),
  line: z.number().optional(),
  character: z.number().optional(),
});

// The comprehensive schema for a single parsed file
export const ParsedFileSchema = z.object({
  filePath: z.string(),
  definitions: z.object({
    functions: z.array(FunctionDefinitionSchema),
    classes: z.array(ClassDefinitionSchema),
    variables: z.array(VariableDefinitionSchema),
  }),
  imports: z.array(ImportStatementSchema),
  exports: z.array(ExportStatementSchema),
  diagnostics: z.array(DiagnosticSchema).optional(),
  codeSnippet: z.string(),
  startLine: z.number(),
  endLine: z.number(),
});

// The root schema for the entire codebase analysis
export const CodebaseSchema = z.object({
  schemaVersion: z.literal(schemaVersion),
  files: z.array(ParsedFileSchema),
  structure: z.record(z.any()), // Can be refined later if needed
  errors: z.array(DiagnosticSchema),
});
