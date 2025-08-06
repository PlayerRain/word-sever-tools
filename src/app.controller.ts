import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { User, users } from './user';
import { clients } from './main';

@Controller("")
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getConfig(@Headers("Authorization") auth: string): object {
    return this.appService.getConfig(auth);
  }

  @Get("items/:id")
  async getItems(@Headers("Authorization") auth: string) {
    return this.appService.getItems(JSON.parse(await users.get(auth.slice(8))));
  }

  @Post("items/:id")
  async equipItem(@Headers("Authorization") auth: string, @Body() body) {
    this.appService.equipItem(JSON.parse(await users.get(auth.slice(8))), body)
    return body;
  }

  @Post("//players/:player_id/friends")
  async setName(@Body() body, @Headers("Authorization") auth: string) {
    const user: User = JSON.parse(await users.get(auth.slice(8)));
    if (body.friend_tag == 0) {
      user.name = body.friend_name;
      User.prototype.store.call(user);
    }
    return "OK"
  }

  @Get("getonline")
  getOnline() {
    return Object.values(clients).map(c=>c.user);
  }
}
