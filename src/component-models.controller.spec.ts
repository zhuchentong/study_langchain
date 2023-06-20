import { Test, TestingModule } from '@nestjs/testing';
import { ComponentModelsController } from './component-models.controller';

describe('ComponentModelsController', () => {
  let controller: ComponentModelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComponentModelsController],
    }).compile();

    controller = module.get<ComponentModelsController>(ComponentModelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
