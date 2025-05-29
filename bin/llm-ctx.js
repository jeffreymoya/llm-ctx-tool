#!/usr/bin/env node
const yargs = require("yargs");

yargs
  .scriptName("llm-ctx")
  .command("index [dir]", "Embed & upsert code into Qdrant", (y) => y.positional("dir", { type: "string", default: "src" }), (argv) => require("../dist/scripts/index-code").main(argv.dir))
  .command("query <query_string>",
    "Perform a semantic search for code snippets based on the provided query string.", 
    (y) => y.positional("query_string", { 
      type: "string", 
      description: "The natural language query string to search for.",
      demandOption: true,
    }), 
    (argv) => {
      if (!argv.query_string || argv.query_string.trim() === "") {
        console.error("Error: query_string cannot be empty.");
        process.exit(1);
      }
      require("../dist/scripts/query-snippets").main(argv.query_string);
    }
  )
  .command("extract <file> <line> <col>", "Dump AST + type info", (y) => y
    .positional("file", { type: "string" })
    .positional("line", { type: "number" })
    .positional("col", { type: "number" }), (argv) => require("../dist/scripts/extract-node-info").main(argv.file, argv.line, argv.col))
  .demandCommand()
  .help()
  .argv; 