import { Controller, Get } from '@nestjs/common'
import { OpenAI, PromptTemplate } from 'langchain'
import { ChatPromptTemplate, FewShotPromptTemplate, HumanMessagePromptTemplate, LengthBasedExampleSelector, PipelinePromptTemplate, SemanticSimilarityExampleSelector, SystemMessagePromptTemplate } from 'langchain/prompts'
import { CombiningOutputParser, CommaSeparatedListOutputParser, CustomListOutputParser, OutputFixingParser, RegexParser, StructuredOutputParser } from 'langchain/output_parsers'
import { ConfigService } from '@nestjs/config'
import { z } from 'zod'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

@Controller('component-prompts')
export class ComponentPromptsController {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  @Get('test-1')
  async promptTemplate() {
    const template = 'What is a good name for a company that makes {product}?'
    const promptA = new PromptTemplate({ template, inputVariables: ['product'] })

    const res1 = await promptA.format({ product: 'socks' })
    console.log(res1)

    const promptB = PromptTemplate.fromTemplate(
      'What is a good name for a company that makes {product}?',
    )

    const res2 = await promptB.format({ product: 'water' })
    console.log(res2)

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        'You are a helpful assistant that translates {input_language} to {output_language}.',
      ),
      HumanMessagePromptTemplate.fromTemplate(
        '{text}',
      ),
    ])

    const res3 = await chatPrompt.format({
      input_language: 'English',
      output_language: 'French',
      text: 'Translate: I love programming',
    })

    console.log(res3)

    const res4 = await chatPrompt.formatPromptValue({
      input_language: 'English',
      output_language: 'French',
      text: 'Translate: I love programming',
    })
    const message = await res4.toChatMessages()

    console.log(message)
    return message
  }

  @Get('test-2')
  async promptComposition() {
    const fullPrompt = PromptTemplate.fromTemplate(`
    {introduction}
    {example}
    {start}
    `)

    const introductionPrompt = PromptTemplate.fromTemplate(
      'You are impersonation {person}',
    )

    const examplePrompt = PromptTemplate.fromTemplate(`
    Here's an example of an interaction:
    Q: {example_q}
    A: {example_a}`)

    const startPrompt = PromptTemplate.fromTemplate(`
    Now, do this for real!
    Q: {input}
    A:`)

    const composedPrompt = new PipelinePromptTemplate({
      pipelinePrompts: [{
        name: 'introduction',
        prompt: introductionPrompt,
      }, {
        name: 'example',
        prompt: examplePrompt,
      }, {
        name: 'start',
        prompt: startPrompt,
      }],
      finalPrompt: fullPrompt,
    })

    const formattedPrompt = await composedPrompt.format({
      person: 'Elon Musk',
      example_q: 'What\'s your favorite car?',
      example_a: 'Telsa',
      input: 'What\'s your favorite social media site?',
    })

    return formattedPrompt
  }

  @Get('test-3')
  async promptValues() {
    const template = 'What is a good name for a company that makes {product}?'
    const promptA = new PromptTemplate({
      template,
      inputVariables: ['product'],
    })

    const res1 = await promptA.formatPromptValue({ product: 'socks' })
    console.log(res1)
    console.log(res1.toString())

    const res2 = res1.toChatMessages()
    console.log(res2)

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate('You are a helpful assistant that translates {input_language} to {output_language}.'),
      HumanMessagePromptTemplate.fromTemplate('{text}'),
    ])

    const res3 = await chatPrompt.formatPromptValue({
      input_language: 'English',
      output_language: 'French',
      text: 'Translate: I love programming',
    })

    console.log(res3)
    console.log(res3.toString())
    console.log(res3.toChatMessages())
  }

  @Get('test-4')
  async partialPrompt() {
    const promptA = new PromptTemplate({
      template: '{foo}{bar}',
      inputVariables: ['foo', 'bar'],
    })

    const partialPromptA = await promptA.partial({ foo: 'foo' })
    console.log(await partialPromptA.format({ bar: 'bar' }))

    const promptB = new PromptTemplate({
      template: '{foo},{bar}',
      inputVariables: ['foo'],
      partialVariables: { bar: 'bar' },
    })

    console.log(await promptB.format({ foo: 'foo' }))

    const promptC = new PromptTemplate({
      template: 'Tell me a {adjective} joke about the day {date}',
      inputVariables: ['adjective', 'date'],
    })

    const partialPromptC = await promptC.partial({ date: () => new Date().toLocaleDateString() })
    console.log(await partialPromptC.format({ adjective: 'funny' }))

    const promptD = new PromptTemplate({
      template: 'Tell me a {adjective} joke about the day {date}',
      inputVariables: ['adjective'],
      partialVariables: { date: () => new Date().toLocaleDateString() },
    })

    console.log(await promptD.format({ adjective: 'sad' }))
  }

  @Get('test-5')
  async fewShotPrompt() {
    const examples = [
      {
        word: 'happy',
        antonym: 'sad',
      },
      {
        word: 'tall',
        antonym: 'short',
      },
    ]

    const exampleFormatTemplate = 'Word: {word}\nAntonym: {antonym}\n'
    const examplePrompt = new PromptTemplate({
      inputVariables: ['word', 'antonym'],
      template: exampleFormatTemplate,
    })

    const fetShotPrompt = new FewShotPromptTemplate({
      examples,
      examplePrompt,
      prefix: 'Give me an antonym for every input',
      suffix: 'Word: {input}\nAntonym:',
      inputVariables: ['input'],
      exampleSeparator: '\n\n',
      templateFormat: 'f-string',
    })
    const res1 = await fetShotPrompt.format({ input: 'big' })

    console.log(res1)
    return res1
  }

  @Get('test-6')
  async outputParser() {
    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      answer: 'answer to user\'s question',
      source: 'source used to answer the user\'s question,should be a website',
    })

    const formatInstructions = parser.getFormatInstructions()

    console.log(formatInstructions)

    const prompt = new PromptTemplate({
      template: 'Answer the users question as best as possible.\n{format_instructions}\n{question}',
      inputVariables: ['question'],
      partialVariables: { format_instructions: formatInstructions },
    })

    const chat = new OpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      temperature: 0,
      configuration: {
        basePath: 'https://openai-proxy.zhuchentong.me/v1/',
      },
    })

    const input = await prompt.format({
      question: 'What is the latest version of nodejs?',
    })

    const res1 = await chat.call(input)
    console.log(res1)
  }

  @Get('test-7')
  async structuredOuputParser() {
    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        answer: z.string().describe('answer to user\'s question'),
        sources: z.array(z.string()).describe('source used to answer the user\'s question,should be a website'),
      }),
    )

    const formatInstructions = parser.getFormatInstructions()

    console.log(formatInstructions)

    const prompt = new PromptTemplate({
      template: 'Answer the users question as best as possible.\n{format_instructions}\n{question}',
      inputVariables: ['question'],
      partialVariables: { format_instructions: formatInstructions },
    })

    const chat = new OpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      temperature: 0,
      configuration: {
        basePath: 'https://openai-proxy.zhuchentong.me/v1/',
      },
    })

    const input = await prompt.format({
      question: 'What is the latest version of nodejs?',
    })

    const res1 = await chat.call(input)
    console.log(res1)
    console.log(await parser.parse(res1))
  }

  @Get('test-8')
  async outputFixingParser() {
    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        answer: z.string().describe('answer to the user\'s question'),
        sources: z
          .array(z.string())
          .describe('sources used to answer the question, should be websites.'),
      }),
    )

    const badOutput = `\`\`\`json
  {
    "answer": "foo",
    "sources": "foo.com"
  }
  \`\`\``

    try {
      await parser.parse(badOutput)
    }
    catch (e) {
      console.log('Failed to parse bad output: ', e)
    }

    const fixParser = OutputFixingParser.fromLLM(
      new ChatOpenAI({ openAIApiKey: this.configService.get('OPENAI_API_KEY'), temperature: 0 }),
      parser,
    )
    const output = await fixParser.parse(badOutput)
    console.log('Fixed output: ', output)
  }

  @Get('test-9')
  async commonSeparatedParser() {
    const parser = new CommaSeparatedListOutputParser()
    const formatInstructions = parser.getFormatInstructions()

    const prompt = new PromptTemplate({
      template: 'List five {subject}.\n{format_instructions}',
      inputVariables: ['subject'],
      partialVariables: { format_instructions: formatInstructions },
    })

    const model = new OpenAI({ temperature: 0, openAIApiKey: this.configService.get('OPENAI_API_KEY') })
    const input = await prompt.format({ subject: 'programming languages' })

    const res1 = await model.call(input)
    console.log(res1)
    console.log(await parser.parse(res1))
  }

  @Get('test-10')
  async customListParser() {
    const parser = new CustomListOutputParser({ length: 5, separator: '\n' })

    const formatInstructions = parser.getFormatInstructions()

    const prompt = new PromptTemplate({
      template: 'List five {subject}.\n{format_instructions}',
      inputVariables: ['subject'],
      partialVariables: { format_instructions: formatInstructions },
    })

    const model = new OpenAI({ temperature: 0, openAIApiKey: this.configService.get('OPENAI_API_KEY') })
    const input = await prompt.format({ subject: 'programming languages' })

    const res1 = await model.call(input)
    console.log(res1)
    console.log(await parser.parse(res1))
  }

  @Get('test-11')
  async combineParser() {
    const answerParser = StructuredOutputParser.fromNamesAndDescriptions({
      answer: 'answer to user\'s question',
      source: 'source used to answer the user\'s question,should be a website',
    })

    const confidenceParser = new RegexParser(
      /Confidence: (A|B|C), Explanation: (.*)/,
      ['confidence', 'explanation'],
      'noConfidence',
    )

    const parser = new CombiningOutputParser(answerParser, confidenceParser)
    const formatInstructions = parser.getFormatInstructions()

    const prompt = new PromptTemplate({
      template:
        'Answer the users question as best as possible.\n{format_instructions}\n{question}',
      inputVariables: ['question'],
      partialVariables: { format_instructions: formatInstructions },
    })

    const model = new OpenAI({ temperature: 0, openAIApiKey: this.configService.get('OPENAI_API_KEY') })
    const input = await prompt.format({
      question: 'What is the capital of France?',
    })
    const response = await model.call(input)

    console.log(input)
  }

  @Get('test-12')
  async selectExampleByLength() {
    const examplePrompt = new PromptTemplate({
      inputVariables: ['input', 'output'],
      template: 'Input: {input}\nOutput: {output}',
    })

    const exampleSelector = await LengthBasedExampleSelector.fromExamples([
      { input: 'happy', output: 'sad' },
      { input: 'tall', output: 'short' },
      { input: 'energetic', output: 'lethargic' },
      { input: 'sunny', output: 'gloomy' },
      { input: 'windy', output: 'calm' },
    ], {
      examplePrompt,
      maxLength: 25,
    })

    const dynamicPrompt = new FewShotPromptTemplate({
      exampleSelector,
      examplePrompt,
      prefix: 'Give the antonym of every input',
      suffix: 'Input: {adjective}\nOutput:',
      inputVariables: ['adjective'],
    })

    console.log(await dynamicPrompt.format({ adjective: 'big' }))

    const longString
    = 'big and huge and massive and large and gigantic and tall and much much much much much bigger than everything else'
    console.log(await dynamicPrompt.format({ adjective: longString }))
  }

  @Get('test-13')
  async selectExampleSimilarity() {
    const examplePrompt = new PromptTemplate({
      inputVariables: ['input', 'output'],
      template: 'Input: {input}\nOutput: {output}',
    })

    const exampleSelector = await SemanticSimilarityExampleSelector.fromExamples([
      { input: 'happy', output: 'sad' },
      { input: 'tall', output: 'short' },
      { input: 'energetic', output: 'lethargic' },
      { input: 'sunny', output: 'gloomy' },
      { input: 'windy', output: 'calm' },
    ],
    new OpenAIEmbeddings(),
    HNSWLib,
    { k: 1 },
    )

    const dynamicPrompt = new FewShotPromptTemplate({
      exampleSelector,
      examplePrompt,
      prefix: 'Give the antonym of every input',
      suffix: 'Input: {adjective}\nOutput:',
      inputVariables: ['adjective'],
    })

    console.log(await dynamicPrompt.format({ adjective: 'rainy' }))

    console.log(await dynamicPrompt.format({ adjective: 'large' }))
  }
}
