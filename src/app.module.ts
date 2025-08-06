import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionController } from './session/session.controller';
import { SessionService } from './session/session.service';
import { RemoveCharsetMiddleware } from './remove-charset.middleware';
import { PlayersController } from './players/players.controller';
import { PlayersService } from './players/players.service';
import { MatchController } from './match/match.controller';
import { MatchService } from './match/match.service';

@Module({
  imports: [],
  controllers: [AppController, SessionController, PlayersController, MatchController],
  providers: [AppService, SessionService, PlayersService, MatchService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RemoveCharsetMiddleware).forRoutes('*');
  }
}
