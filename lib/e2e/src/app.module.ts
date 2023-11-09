import { Module } from '@nestjs/common';
import { PingModule } from './ping/ping.module';

@Module({
  imports: [PingModule]
})
export class ApplicationModule {}
