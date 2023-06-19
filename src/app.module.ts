import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppService } from './app.service'
import { UsingLlmsController } from './using-llms.controller'
import { AppController } from './app.controller'
import { UsingChatModelsController } from './using-chat-models.controller'

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, UsingLlmsController, UsingChatModelsController],
  providers: [AppService],
})
export class AppModule {}
