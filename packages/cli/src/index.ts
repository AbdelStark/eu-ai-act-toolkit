import { Command } from 'commander';
import { classifyCommand } from './commands/classify.js';
import { checklistCommand } from './commands/checklist.js';
import { timelineCommand } from './commands/timeline.js';
import { generateCommand } from './commands/generate.js';
import { statusCommand } from './commands/status.js';
import { reportCommand } from './commands/report.js';

const program = new Command()
  .name('eu-ai-act')
  .description('EU AI Act compliance toolkit — classify, track, and document.\n\nThis tool does not constitute legal advice. Consult qualified legal counsel for compliance decisions.')
  .version('0.1.0');

program.addCommand(classifyCommand);
program.addCommand(checklistCommand);
program.addCommand(timelineCommand);
program.addCommand(generateCommand);
program.addCommand(statusCommand);
program.addCommand(reportCommand);

program.parse();
