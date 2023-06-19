import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { UsingLlmsController } from './using-llms.controller'

describe('UsingLlmsController', () => {
  let controller: UsingLlmsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsingLlmsController],
    }).compile()

    controller = module.get<UsingLlmsController>(UsingLlmsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
