import { Test, TestingModule } from '@nestjs/testing';
import { ComponentSchemaController } from './component-schema.controller';

describe('ComponentSchemaController', () => {
  let controller: ComponentSchemaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComponentSchemaController],
    }).compile();

    controller = module.get<ComponentSchemaController>(ComponentSchemaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
