#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .command('index', 'Index files in a Qdrant collection', () => {},
    (argv) => {
      console.log('Placeholder for index command', argv);
    }
  )
  .command('query', 'Query a Qdrant collection', () => {},
    (argv) => {
      console.log('Placeholder for query command', argv);
    }
  )
  .command('extract', 'Extract context from files based on a query', () => {},
    (argv) => {
      console.log('Placeholder for extract command', argv);
    }
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .version()
  .argv; 