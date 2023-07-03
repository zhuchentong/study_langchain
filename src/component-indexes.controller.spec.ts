import { Test, TestingModule } from '@nestjs/testing';
import { ComponentIndexesController } from './component-indexes.controller';

describe('ComponentIndexesController', () => {
  let controller: ComponentIndexesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComponentIndexesController],
    }).compile();

    controller = module.get<ComponentIndexesController>(ComponentIndexesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
