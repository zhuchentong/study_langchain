import { Controller } from '@nestjs/common'
import { AIChatMessage, HumanChatMessage, SystemChatMessage } from 'langchain/schema'
import { Document } from 'langchain/document'

@Controller('component-schema')
export class ComponentSchemaController {
  private systemMessage = new SystemChatMessage('system message')
  private humanMessage = new HumanChatMessage('human message')
  private aiMessage = new AIChatMessage('ai message')

  private document = new Document({ pageContent: 'foo', metadata: { source: 1 } })
  private example = {
    input: 'foo',
    output: 'bar',
  }
}
