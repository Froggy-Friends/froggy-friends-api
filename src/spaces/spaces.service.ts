import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Client } from "twitter-api-sdk";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SpacesService {
  client: Client;

  constructor(private readonly configs: ConfigService) {
    this.client = new Client("MY-BEARER-TOKEN");
  }

  async getSpacesForHost(twitterUsername: string) {
    const user = await this.client.users.findUserByUsername(twitterUsername);
    if (user.errors) {
      console.log("user errors: ", user.errors);
      throw new HttpException("Invalid twitter username", HttpStatus.BAD_REQUEST);
    }
    if (!user.data) {
      console.log("no user data found: ", user);
      throw new HttpException("Invalid twitter username", HttpStatus.BAD_REQUEST);
    }

    const spaces = await this.client.spaces.findSpacesByCreatorIds({ user_ids: [user.data.id]});
    if (spaces.errors) {
      console.log("error fetching spaces for user: ", spaces.errors);
      throw new HttpException("Invalid twitter username", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return spaces.data;
  }
}