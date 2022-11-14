import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Client } from "twitter-api-sdk";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SpacesService {
  private readonly logger = new Logger(SpacesService.name);
  client: Client;

  constructor(private readonly configs: ConfigService) {
    const token = configs.get<string>('TWITTER_TOKEN');
    this.client = new Client(token);
  }

  async getSpacesForHost(twitterUsername: string) {
    const user = await this.client.users.findUserByUsername(twitterUsername);
    if (user.errors) {
      console.log("user errors: ", user.errors);
      this.logger.error(`fetching user ${twitterUsername} errors ${user.errors}`);
      throw new HttpException("Invalid twitter username", HttpStatus.BAD_REQUEST);
    }
    if (!user.data) {
      this.logger.error(`fetching user ${twitterUsername} missing data`);
      throw new HttpException("Invalid twitter username", HttpStatus.BAD_REQUEST);
    }

    const spaces = await this.client.spaces.findSpacesByCreatorIds({ 
        user_ids: [user.data.id],
        "space.fields": ['scheduled_start', 'state', 'title']
    });
    if (spaces.errors) {
      this.logger.error(`fetching spaces for user ${user.data.username} error ${spaces.errors}`);
      throw new HttpException("Invalid twitter username", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return spaces.data;
  }
}