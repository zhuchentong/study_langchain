import { Test, TestingModule } from '@nestjs/testing';
import { ComponentMemoryController } from './component-memory.controller';

describe('ComponentMemoryController', () => {
  let controller: ComponentMemoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComponentMemoryController],
    }).compile();

    controller = module.get<ComponentMemoryController>(ComponentMemoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
