import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OpenAI } from 'langchain'
import { RetrievalQAChain, loadQAStuffChain } from 'langchain/chains'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { Browser, Page, PlaywrightWebBaseLoader } from 'langchain/document_loaders/web/playwright'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'

@Controller('component-indexes')
export class ComponentIndexesController {
  constructor(private readonly configService: ConfigService) {}

  @Get('load-text-files')
  async loadTextFiles() {
    const loader = new TextLoader('src/example/txt/example1.txt')
    const docs = await loader.load()

    return docs
  }

  @Get('load-web-playwright')
  async loadWebPlaywright() {
    const loader = new PlaywrightWebBaseLoader('https://www.baidu.com', {
      launchOptions: {
        headless: true,
      },
      gotoOptions: {
        waitUntil: 'domcontentloaded',
      },
      async evaluate(page: Page, browser: Browser) {
        await page.waitForResponse('https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=%E6%9C%80%E6%96%B0nodejs%E7%89%88%E6%9C%AC&fenlei=256&oq=202%2526lt%253B%25E5%25B9%25B4%25E7%25AB%25AF%25E5%258D%2588%25E8%258A%2582&rsv_pq=e03e9d510004e585&rsv_t=602cRLE84dng7aVJdcZ2mRCDlU1rMLjOW7V%2FJPr68L%2Fbox30lt0TuVqQoqU&rqlang=cn&rsv_enter=1&rsv_dl=tb&rsv_btype=t&inputT=4701&rsv_sug3=94&rsv_sug1=40&rsv_sug7=100&rsv_sug2=0&rsv_sug4=5108')

        const result = await page.evaluate(() => document.body.innerHTML)
        return result
      },
    })
    const content = await loader.load()
    return content
  }

  @Get('text-splitter')
  async textSplitter() {
    const splitter = new CharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 200,
    })

    const jimDocs = await splitter.createDocuments(['My Favorite color is blue'],
      [],
      {
        chunkHeader: 'Document Name : Jim Interview\n\n---\n\n',
        appendChunkOverlapHeader: true,
      })

    const pamDocs = await splitter.createDocuments(['My Favorite color is red'],
      [],
      {
        chunkHeader: 'Document Name : Pam Interview\n\n---\n\n',
        appendChunkOverlapHeader: true,
      })

    const vectorStore = await HNSWLib.fromDocuments(jimDocs.concat(pamDocs), new OpenAIEmbeddings())

    const model = new OpenAI({ temperature: 0, openAIApiKey: this.configService.get('OPENAI_API_KEY') })

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(model),
      retriever: vectorStore.asRetriever(),
      returnSourceDocuments: true,
    })

    const res = await chain.call({
      query: 'What is Pam\'s favorite color?',
    })

    return res
  }

  @Get('memory-vector-store')
  async memoryVectorStore() {
    const vectorStore = await MemoryVectorStore.fromTexts(
      ['hello World', 'Bye bye', 'hello nice world'],
      [{ id: 2 }, { id: 1 }, { id: 3 }],
      new OpenAIEmbeddings(),
    )

    const resultOne = await vectorStore.similaritySearch('Hello world', 1)

    return resultOne
  }
}
