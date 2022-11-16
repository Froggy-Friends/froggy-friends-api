import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Client } from "twitter-api-sdk";
import { ConfigService } from "@nestjs/config";
import { spaces } from './spaces.data';
import { Space, SpaceHost, SpaceShow } from "./spaces.models";
@Injectable()
export class SpacesService {
  private readonly logger = new Logger(SpacesService.name);
  client: Client;
  spaces: Space[];

  constructor(private readonly configs: ConfigService) {
    const token = configs.get<string>('TWITTER_TOKEN');
    this.client = new Client(token);
    this.spaces = [];
  }

  private timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSpaces() {
    return this.spaces;
  }

  async refreshSpaces() {
    let spacesUpdated: Space[] = [];
    for (const space of spaces) {
      const shows = await this.getShowsForHost(space.host);
      spacesUpdated.push({
        ...space,
        scheduledShows: shows
      });
    }
    this.spaces = spacesUpdated;
    return true;
  }

  async getShowsForHost(host: SpaceHost): Promise<SpaceShow[]> {
    try {
      let spaceShows: SpaceShow[] = [];
      const user = await this.client.users.findUserByUsername(host.twitterHandle);
      await this.timeout(1000);
      const scheduledSpaces = await this.client.spaces.findSpacesByCreatorIds({ 
          user_ids: [user.data.id],
          "space.fields": ['scheduled_start', 'state', 'title']
      });
      await this.timeout(1000);

      if (scheduledSpaces.data) {
        for (const space of scheduledSpaces.data) {
          spaceShows.push({
            id: space.id,
            title: space.title,
            state: space.state,
            scheduledStart: space.scheduled_start
          });
        }
      }

      return spaceShows;
    } catch (error) {
      this.logger.error(`fetching spaces error ${error}`);
      throw new HttpException("Error fetching scheduled spaces", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}