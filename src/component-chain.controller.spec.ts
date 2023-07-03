import { Test, TestingModule } from '@nestjs/testing';
import { ComponentChainController } from './component-chain.controller';

describe('ComponentChainController', () => {
  let controller: ComponentChainController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComponentChainController],
    }).compile();

    controller = module.get<ComponentChainController>(ComponentChainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
