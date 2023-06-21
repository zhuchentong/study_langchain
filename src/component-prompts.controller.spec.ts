import { Test, TestingModule } from '@nestjs/testing';
import { ComponentPromptsController } from './component-prompts.controller';

describe('ComponentPromptsController', () => {
  let controller: ComponentPromptsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComponentPromptsController],
    }).compile();

    controller = module.get<ComponentPromptsController>(ComponentPromptsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
