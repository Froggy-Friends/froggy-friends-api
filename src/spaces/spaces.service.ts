import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Client } from "twitter-api-sdk";
import { ConfigService } from "@nestjs/config";
import { ScheduledShow } from "./spaces.data";
import { spaces } from './spaces.data';
@Injectable()
export class SpacesService {
  private readonly logger = new Logger(SpacesService.name);
  client: Client;
  scheduledShows: ScheduledShow[];

  constructor(private readonly configs: ConfigService) {
    const token = configs.get<string>('TWITTER_TOKEN');
    this.client = new Client(token);
    this.scheduledShows = [];
  }

  async getScheduledShows() {
    for (const space of spaces) {
      const shows = await this.getShowsForHost(space.handle);
      
    }
  }

  async getShowsForHost(twitterUsername: string): Promise<ScheduledShow[]> {
    try {
      let scheduledShows: ScheduledShow[] = [];
      const user = await this.client.users.findUserByUsername(twitterUsername);
      const spaces = await this.client.spaces.findSpacesByCreatorIds({ 
          user_ids: [user.data.id],
          "space.fields": ['scheduled_start', 'state', 'title']
      });

      for (const space of spaces.data) {
        scheduledShows.push({
          id: space.id,
          title: space.title,
          state: space.state,
          scheduledStart: space.scheduled_start
        });
      }

      return scheduledShows;
    } catch (error) {
      this.logger.error(`fetching spaces error ${error}`);
      throw new HttpException("Error fetching scheduled spaces", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}