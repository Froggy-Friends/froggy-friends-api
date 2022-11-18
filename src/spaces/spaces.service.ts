import { Injectable, Logger } from "@nestjs/common";
import { Client } from "twitter-api-sdk";
import { ConfigService } from "@nestjs/config";
import { calendar } from './spaces.data';
import { Space, SpacesCalendar, ScheduledSpace } from "./spaces.models";
import { Cron, CronExpression } from "@nestjs/schedule";
@Injectable()
export class SpacesService {
  private readonly logger = new Logger(SpacesService.name);
  client: Client;
  calendar: SpacesCalendar;
  scheduledSpaces: ScheduledSpace[];

  constructor(private readonly configs: ConfigService) {
    this.client = new Client(configs.get<string>('TWITTER_TOKEN'));
    this.calendar = {...calendar};
    this.scheduledSpaces = [];
  }

  private timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSpaces() {
    return this.calendar;
  }

  getScheduledSpaces() {
    return this.scheduledSpaces;
  }

  @Cron(CronExpression.EVERY_12_HOURS, { name: "spaces", timeZone: "America/Los_Angeles"})
  async refreshSpaces() {
    this.initSpaces();
  }

  async initSpaces() {
    try {
      this.logger.log("Creating spaces")
      this.scheduledSpaces = await this.processScheduledSpaces();
      this.logger.log("Spaces created: " + this.scheduledSpaces.length);
      return true;
    } catch (error) {
      this.logger.log("Create spaces error: " + error);
    }
  }

  async processScheduledSpaces(): Promise<ScheduledSpace[]> {
    let scheduledSpaces: ScheduledSpace[] = [];
    let handlesMap = new Map<string, Space>();

    // map host twitter handle to host details
    for (const day in calendar) {
      const spaces: Space[] = calendar[day];
      spaces.forEach(space => {
        if (!handlesMap.has(space.host.twitterHandle)) {
          handlesMap.set(space.host.twitterHandle, space);
        }
      })
    }

    // fetch scheduled spaces for each host
    for (const [handle, space] of handlesMap.entries()) {
      const shows = await this.getScheduledShows(space);
      scheduledSpaces = scheduledSpaces.concat(shows);
    }

    return scheduledSpaces;
  }

  private async getScheduledShows(space: Space): Promise<ScheduledSpace[]> {
    let shows: ScheduledSpace[] = [];
    const user = await this.client.users.findUserByUsername(space.host.twitterHandle);
    await this.timeout(1000);
    const scheduledSpaces = await this.client.spaces.findSpacesByCreatorIds({ 
        user_ids: [user.data.id],
        "space.fields": ['scheduled_start', 'state', 'title']
    });
    await this.timeout(1000);

    if (scheduledSpaces.data) {
      for (const show of scheduledSpaces.data) {
        shows.push({
          id: show.id,
          title: show.title,
          state: show.state,
          scheduledStart: show.scheduled_start,
          space: space
        });
      }
    }

    return shows;
  }
}