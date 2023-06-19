import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SerpAPI } from 'langchain/tools'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema'
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from 'langchain/prompts'

import { LLMChain } from 'langchain'
import { AgentExecutor, ChatAgent } from 'langchain/agents'
import { ConversationChain } from 'langchain/chains'
import { BufferMemory } from 'langchain/memory'

@Controller('using-chat-models')
export class UsingChatModelsController {
  private readonly chat: ChatOpenAI
  private readonly serpapi: SerpAPI

  constructor(private readonly configService: ConfigService) {
    this.chat = new ChatOpenAI({
      temperature: 0,
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
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

  @Get('single-message')
  async singleMessage() {
    return await this.chat.call([
      new HumanChatMessage(
        'Translate this sentence from English to French. I love programming.',
      ),
    ])
  }

  @Get('multiple-messages')
  async multipleMessages() {
    return await this.chat.call([
      new SystemChatMessage('You are a helpful assistant that translates English to French.'),
      new HumanChatMessage('Translate this sentence from English to French. I hate programming.'),
    ])
  }

  @Get('multiple-completions')
  async multipleCompletions() {
    return await this.chat.generate([
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
  }

  @Get('chat-prompt-templates')
  async chatPromptTemplates() {
    const translationPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate('You are a helpful asssistant that translates {input_language} to {output_language}.'),
      HumanMessagePromptTemplate.fromTemplate('{text}'),
    ])

    return await this.chat.generatePrompt([
      await translationPrompt.formatPromptValue({
        input_language: 'English',
        output_language: 'French',
        text: 'I Love Programming',
      }),
    ])
  }

  @Get('llm-chain')
  async llmChain() {
    const translationPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate('You are a helpful asssistant that translates {input_language} to {output_language}.'),
      HumanMessagePromptTemplate.fromTemplate('{text}'),
    ])

    const chain = new LLMChain({
      prompt: translationPrompt,
      llm: this.chat,
    })

    return await chain.call({
      input_language: 'English',
      output_language: 'French',
      text: 'I Love Programming',
    })
  }

  @Get('dynamically-run-chain')
  async dynamicallyRunChain() {
    const tools = [
      this.serpapi,
    ]

    const agent = ChatAgent.fromLLMAndTools(this.chat, tools)
    const executor = AgentExecutor.fromAgentAndTools({ agent, tools })

    const response = await executor.run(
      'what is the latest Nodejs Version of 2023?',
    )

    console.log(response)
    return response
  }

  @Get('agent-memory')
  async agentMemory() {
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        'The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.',
      ),

      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ])

    const chain = new ConversationChain({
      memory: new BufferMemory({ returnMessages: true, memoryKey: 'history' }),
      prompt: chatPrompt,
      llm: this.chat,
    })

    const response1 = await chain.call({
      input: 'hi from Japan, how are you doing today',
    })

    console.log(response1)

    const response2 = await chain.call({
      input: 'Do you know where I am?',
    })

    console.log(response2)

    return {
      response1,
      response2,
    }
  }

  @Get('streaming')
  async streaming() {
    let content = ''
    const chat = new ChatOpenAI({
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken: (token) => {
            process.stdout.write(token)
            content += token
          },
        },
      ],
      temperature: 0,
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      configuration: {
        basePath: 'https://openai-proxy-1.zhuchentong.me/v1',
      },
    })

    await chat.call([
      new HumanChatMessage('Write me a Song about sparkling wate'),
    ])

    return content
  }
}
