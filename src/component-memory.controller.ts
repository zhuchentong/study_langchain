import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OpenAI } from 'langchain'
import { ConversationChain } from 'langchain/chains'
import { BufferMemory, ChatMessageHistory } from 'langchain/memory'
import { AIChatMessage, HumanChatMessage } from 'langchain/schema'

@Controller('component-memory')
export class ComponentMemoryController {
  constructor(private readonly configService: ConfigService) {}

  @Get('buffer-memory')
  async bufferMemory() {
    const model = new OpenAI({ temperature: 0, openAIApiKey: this.configService.get('OPENAI_API_KEY') })
    const memory = new BufferMemory()

    const pastMessages = [
      new HumanChatMessage('My name\'s Jonas'),
      new AIChatMessage('Nice to meet you, Jonas!'),
    ]

    const memory1 = new BufferMemory({
      chatHistory: new ChatMessageHistory(pastMessages),
    })

    const chain = new ConversationChain({ llm: model, memory: memory1 })

    // const res1 = await chain.call({ input: 'Hi I\'m Jim' })
    // console.log(res1)

    const res2 = await chain.call({ input: 'what\'s my name?' })
    console.log(res2)

    return { res2 }
  }
}
