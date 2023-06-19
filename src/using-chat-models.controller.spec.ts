import { Test, TestingModule } from '@nestjs/testing'
import { UsingChatModelsController } from './using-chat-models.controller'

describe('UsingChatModelsController', () => {
  let controller: UsingChatModelsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsingChatModelsController],
    }).compile()

    controller = module.get<UsingChatModelsController>(UsingChatModelsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
