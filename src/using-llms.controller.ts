import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { ConversationChain, LLMChain } from 'langchain/chains'
import { OpenAI } from 'langchain/llms/openai'
import { BufferMemory } from 'langchain/memory'
import { PromptTemplate } from 'langchain/prompts'
import { SerpAPI } from 'langchain/tools'
import { Calculator } from 'langchain/tools/calculator'

@Controller('using-llms')
export class UsingLlmsController {
  private readonly model: OpenAI
  private readonly serpapi: SerpAPI

  constructor(private readonly configService: ConfigService) {
    this.model = new OpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      temperature: 0.9,
      configuration: {
        basePath: 'https://openai-proxy-1.zhuchentong.me/v1',
      },
    })

    this.serpapi = new SerpAPI(process.env.SERPAPI_API_KEY, {
      location: 'Austin,Texas,United States',
      hl: 'en',
      gl: 'us',
    })
  }

  @Get('get-predictions')
  async getPredictions() {
    const res = await this.model.call(
      'What would be a good company name a company that makes colorful socks?',
    )
    return res
  }

  @Get('prompt-templates')
  async promptTemplates() {
    const template = 'What is a good name for a company that makes {product}?'
    const prompt = new PromptTemplate({
      template,
      inputVariables: ['product'],
    })

    const res = await prompt.format({ product: 'colorful socks' })
    return res
  }

  @Get('combine-white-prompts')
  async combineWithPrompts() {
    const template = 'What is a good name for a company that makes {product}?'
    const prompt = new PromptTemplate({
      template,
      inputVariables: ['product'],
    })

    const chain = new LLMChain({ llm: this.model, prompt })
    const res = await chain.call({ product: 'colorful socks' })

    return res
  }

  @Get('dynamically-run-chains')
  async dynamicallyRunChains() {
    const tools = [this.serpapi, new Calculator()]

    const executor = await initializeAgentExecutorWithOptions(
      tools,
      this.model,
      {
        agentType: 'zero-shot-react-description',
      },
    )
    console.log('Loaded agent.')

    const input
      = 'Who is Olivia Wilde\'s boyfriend?'
      + ' What is his current age raised to the 0.23 power?'
    console.log(`Executing with input "${input}"...`)

    const result = await executor.call({ input })

    console.log(`Got output ${result.output}`)

    return result
  }

  @Get('agent-memory')
  async agentMemory() {
    const memory = new BufferMemory()
    const chain = new ConversationChain({ llm: this.model, memory })
    const res1 = await chain.call({ input: 'Hi!I\'m Jim' })
    console.log(res1)
    const res2 = await chain.call({ input: 'what\'s my name?' })
    console.log(res2)

    return {
      res1,
      res2,
    }
  }

  @Get('streaming')
  async streaming() {
    let content = ''
    const chat = new OpenAI({
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken: (token) => {
            process.stdout.write(token)
            content += token
          },
        },
      ],
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      temperature: 0.9,
      configuration: {
        basePath: 'https://openai-proxy-1.zhuchentong.me/v1',
      },
    })

    await chat.call('Write me a sone about sparkling water.')
    return content
  }
}
