import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppService } from './app.service'
import { UsingLlmsController } from './using-llms.controller'
import { AppController } from './app.controller'
import { UsingChatModelsController } from './using-chat-models.controller'
import { ComponentSchemaController } from './component-schema.controller'
import { ComponentModelsController } from './component-models.controller'
import { ComponentPromptsController } from './component-prompts.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, UsingLlmsController, UsingChatModelsController, ComponentSchemaController, ComponentModelsController, ComponentPromptsController],
  providers: [AppService],
})
export class AppModule {}
