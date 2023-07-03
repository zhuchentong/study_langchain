import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppService } from './app.service'
import { UsingLlmsController } from './using-llms.controller'
import { AppController } from './app.controller'
import { UsingChatModelsController } from './using-chat-models.controller'
import { ComponentSchemaController } from './component-schema.controller'
import { ComponentModelsController } from './component-models.controller'
import { ComponentPromptsController } from './component-prompts.controller';
import { ComponentIndexesController } from './component-indexes.controller';
import { ComponentMemoryController } from './component-memory.controller';
import { ComponentChainController } from './component-chain.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, UsingLlmsController, UsingChatModelsController, ComponentSchemaController, ComponentModelsController, ComponentPromptsController, ComponentIndexesController, ComponentMemoryController, ComponentChainController],
  providers: [AppService],
})
export class AppModule {}
