import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Client } from "twitter-api-sdk";
import { ConfigService } from "@nestjs/config";
import { spaces as spacesData } from './spaces.data';
import { Space, SpaceHost, SpaceShow } from "./spaces.models";
import { Cron, CronExpression } from "@nestjs/schedule";
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

  @Cron(CronExpression.EVERY_12_HOURS, { name: "spaces", timeZone: "America/Los_Angeles"})
  async refreshSpaces() {
    this.initSpaces();
  }

  async initSpaces() {
    try {
      this.logger.log("Creating spaces")
      this.spaces = await this.processSpaces();
      this.logger.log("Spaces created: " + this.spaces.length);
      return true;
    } catch (error) {
      this.logger.log("Create spaces error: " + error);
    }
  }

  async processSpaces(): Promise<Space[]> {
    let updatedSpaces: Space[] = [];
    for (const space of spacesData) {
      const shows = await this.getShowsForHost(space.host);
      updatedSpaces.push({
        ...space,
        scheduledShows: shows
      });
    }
    return updatedSpaces;
  }

  async getShowsForHost(host: SpaceHost): Promise<SpaceShow[]> {
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
  }
}