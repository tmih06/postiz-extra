import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// Nest externalizes these packages, so a successful build does not prove that
// Node can load the backend's AI dependencies together.
describe('backend Node dependencies', () => {
  it('loads CopilotKit alongside the application LangChain integrations', () => {
    const output = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
          import { CopilotRuntime } from '@copilotkit/runtime';
          import { ChatPromptTemplate } from '@langchain/core/prompts';
          import { StateGraph } from '@langchain/langgraph';
          import { ChatOpenAI } from '@langchain/openai';
          import { TavilySearch } from '@langchain/tavily';
          const prompt = ChatPromptTemplate.fromMessages([
            ['human', 'Hello {name}'],
          ]);
          const formatted = await prompt.format({ name: 'Postiz' });
          if (![CopilotRuntime, StateGraph, ChatOpenAI, TavilySearch].every(
            (value) => typeof value === 'function'
          )) throw new Error('Missing backend dependency exports');
          process.stdout.write(formatted);
        `,
      ],
      { encoding: 'utf8', timeout: 30_000 }
    );

    expect(output).toBe('Human: Hello Postiz');
  });
});
