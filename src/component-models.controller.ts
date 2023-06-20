import { Serializable } from 'node:child_process'
import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OpenAI } from 'langchain'
import { ChatOpenAI, PromptLayerChatOpenAI } from 'langchain/chat_models/openai'
import { HumanChatMessage, LLMResult, SystemChatMessage } from 'langchain/schema'
import { SerpAPI } from 'langchain/tools'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { createClient } from 'redis'
import { RedisCache } from 'langchain/cache/redis'

@Controller('component-models')
export class ComponentModelsController {
  private readonly model: OpenAI

  constructor(private readonly configService: ConfigService) {}

  @Get('test-1')
  async test1() {
    const chat = new ChatOpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      temperature: 0,
      modelName: 'gpt-3.5-turbo-0613',
    })

    const res1 = await chat.predictMessages(
      [new HumanChatMessage('What is the weather in New York?')],
      {
        tools: [new SerpAPI(process.env.SERPAPI_API_KEY, {
          location: 'Austin,Texas,United States',
          hl: 'en',
          gl: 'us',
        })],
      },

    )

    console.log(res1)

    const res2 = await chat.predictMessages([
      new HumanChatMessage('What is the weather in New York?'),
    ], {
      functions: [
        {
          name: 'get_current_weather',
          description: 'Get the current weather in a given location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The city and state, e.g. San Francisco, CA',
              },
              unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
            },
            required: ['location'],
          },
        },
      ],
      function_call: {
        name: 'get_current_weather',
      },
    })

    console.log(res2)
  }

  @Get('test-2')
  async promptLayer() {
    const chat = new PromptLayerChatOpenAI({
      returnPromptLayerId: true,
      // openAIApiKey: this.configService.get('OPENAI_API_KEY'),
    })
    const res1 = await chat.generate([
      [new SystemChatMessage('You are a helpful assistant that translates English to French.')],
    ])

    console.log(JSON.stringify(res1, null, 3))
  }

  @Get('test-3')
  async additionalMethods() {
    const chat = new ChatOpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      modelName: 'gpt-3.5-turbo',
    })

    const res1 = await chat.call([
      new HumanChatMessage('What is a good name for a company that makes colorful socks?'),
    ])

    console.log(res1)

    const res2 = await chat.call([
      new SystemChatMessage('You are a helpful assistant that translates English to French.'),
      new HumanChatMessage('Translate: I love programming'),
    ])

    console.log(res2)

    const res3 = await chat.generate([
      [
        new SystemChatMessage(
          'You are a helpful assistant that translates English to French.',
        ),
        new HumanChatMessage(
          'Translate this sentence from English to French. I love programming.',
        ),
      ],
      [
        new SystemChatMessage(
          'You are a helpful assistant that translates English to French.',
        ),
        new HumanChatMessage(
          'Translate this sentence from English to French. I love artificial intelligence.',
        ),
      ],
    ])

    return res3
  }

  @Get('test-4')
  async streaming() {
    const chat = new ChatOpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      maxTokens: 25,
      streaming: true,
    })

    const res1 = await chat.call([
      new HumanChatMessage('Tell me a joke.'),
    ], undefined, [{
      handleLLMNewToken(token: string) {
        console.log({ token })
      },
    }])

    return res1
  }

  @Get('test-5')
  async timeout() {
    const chat = new ChatOpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      temperature: 1,
    })

    const res1 = await chat.call([
      new HumanChatMessage('What\'s is a good name for company that makes colorful socks?'),
    ], { timeout: 2000 })

    console.log(res1)

    return res1
  }

  @Get('test-6')
  async cancenlling() {
    const chat = new ChatOpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      temperature: 1,
    })

    const controller = new AbortController()

    const res = await chat.call([
      new HumanChatMessage(
        'What is a good name for a company that makes colorful socks?',
      ),
    ], {
      signal: controller.signal,
    })

    console.log(res)
    return res
  }

  @Get('test-7')
  async rateLimits() {
    const chat = new ChatOpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      temperature: 1,
      maxConcurrency: 5,
      maxRetries: 5,
    })

    const res = await chat.call([
      new HumanChatMessage(
        'What is a good name for a company that makes colorful socks?',
      ),
    ])

    console.log(res)
    return res
  }

  @Get('test-8')
  async subscribing() {
    const model = new ChatOpenAI({
      callbacks: [
        {
          handleLLMStart: async (llm: Serializable, prompts: string[]) => {
            console.log(JSON.stringify(llm, null, 2))
            console.log(JSON.stringify(prompts, null, 2))
          },
          handleLLMEnd: async (output: LLMResult) => {
            console.log(JSON.stringify(output, null, 2))
          },
          handleLLMError: async (err: Error) => {
            console.log(err)
          },
        },
      ],
    })

    await model.call([
      new HumanChatMessage(
        'What is a good name for a company that makes colorful socks?',
      ),
    ])
  }

  @Get('test-9')
  async embeddings() {
    const embeddings = new OpenAIEmbeddings()

    const res1 = await embeddings.embedQuery('Hello world')

    console.log(res1)

    const res2 = await embeddings.embedDocuments(['Hello world', 'Bye bye'])
    console.log(res2)
    return res2
  }

  @Get('test-10')
  async LLMSAddFunction() {
    const chat = new OpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      temperature: 0.9,
    })

    const resA = await chat.call(
      'What would be a good company name a company that makes colorful socks?',
    )
    console.log({ resA })

    const resB = await chat.generate([
      'What would be a good company name a company that makes colorful socks?',
      'What would be a good company name a company that makes colorful sweaters?',
    ])

    console.log(JSON.stringify(resB, null, 2))

    const numTokens = await chat.getNumTokens('How many tokens are in this input?')
    console.log(numTokens)
  }

  @Get('test-11')
  async cacheInMemory() {
    const client = createClient({
      url: 'redis://localhost:6379',
    })
    await client.connect()
    const cache = new RedisCache(client)

    const chat = new OpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      temperature: 0.9,
      cache,
      streaming: true,
    })

    const resA = await chat.call(
      'write a poem for the girl and the boy that in school?'
      , undefined, [
        {
          handleLLMNewToken: async (token: string) => {
            console.log(token)
          },
        },
      ])

    console.log({ resA })
  }
}
