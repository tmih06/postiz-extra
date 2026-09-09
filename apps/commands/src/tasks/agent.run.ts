import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { AgentGraphService } from '@gitroom/nestjs-libraries/agent/agent.graph.service';

@Injectable()
export class AgentRun {
  constructor(private _agentGraphService: AgentGraphService) {}
  @Command({
    command: 'run:agent',
    describe: 'Run the agent',
  })
  async agentRun() {
    for await (const event of this._agentGraphService.start('test', {
      research: 'hello world research',
      isPicture: false,
      format: 'one_short',
      tone: 'personal',
    })) {
      console.log(event);
    }
  }
}
