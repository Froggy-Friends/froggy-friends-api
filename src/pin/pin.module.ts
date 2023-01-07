import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PinService } from 'src/pin/pin.service';

@Module({
  imports: [ConfigModule],
  providers: [ConfigService, PinService],
  exports: [ConfigService, PinService]
})

export class PinModule {}