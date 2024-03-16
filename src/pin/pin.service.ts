import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const pinataSDK = require('@pinata/sdk');
import { Readable } from 'stream';

@Injectable()
export class PinService {
  private pinata: any;

  constructor(private configService: ConfigService) {
    this.pinata = new pinataSDK(
      this.configService.get('PINATA_API_KEY'),
      this.configService.get('PINATA_API_SECRET'),
    );
  }

  async unpin(cid: string) {
    try {
      await this.pinata.unpin(cid);
    } catch (error) {
      console.log('error working with existing files: ', error);
    }
  }

  async uploadFromFs(name: string, path: string) {
    try {
      return await this.pinata.pinFromFS(path, {
        pinataMetadata: { name: name },
      });
    } catch (error) {
      console.log('error uploading file from fs: ', error);
    }
  }

  async upload(name: string, image: Buffer) {
    try {
      const stream = Readable.from(image);
      const imagePin = await this.pinata.pinFileToIPFS(stream, {
        pinataMetadata: { name: name },
      });
      return imagePin;
    } catch (error) {
      console.log('error uploading file: ', error);
    }
  }
}
