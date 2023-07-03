import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OpenAI } from 'langchain'
import { loadQAMapReduceChain, loadQAStuffChain } from 'langchain/chains'
import { Document } from 'langchain/document'

@Controller('component-chain')
export class ComponentChainController {
  constructor(private readonly configService: ConfigService) {}

  @Get('stuff-document-chain')
  async stuffDocumentChain() {
    const llmA = new OpenAI({ temperature: 0, openAIApiKey: this.configService.get('OPENAI_API_KEY') })
    const chainA = loadQAStuffChain(llmA)

    const docs = [
      new Document({ pageContent: 'Harrison went to Harvard' }),
      new Document({ pageContent: 'Ankush went to Princeton' }),
    ]

    const resA = await chainA.call({ input_documents: docs, question: 'where did Harrison go to college?' })

    console.log(resA)

    const llmB = new OpenAI({ maxConcurrency: 10, temperature: 0, openAIApiKey: this.configService.get('OPENAI_API_KEY') })

    const chainB = loadQAMapReduceChain(llmB)

    const resB = await chainB.call({
      input_documents: docs,
      question: 'where did Harrison go to college?',
    })

    console.log(resB)

    return { resA, resB }
  }
}
