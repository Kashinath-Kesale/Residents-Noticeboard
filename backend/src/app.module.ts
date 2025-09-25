/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Corrected import paths
import { AnnouncementController } from './announcement/announcement.controller';
import { AnnouncementService } from './announcement/announcement.service';

@Module({
  imports: [],
  // Add the controller here
  controllers: [AppController, AnnouncementController],
  // Add the service here
  providers: [AppService, AnnouncementService],
})
export class AppModule {}