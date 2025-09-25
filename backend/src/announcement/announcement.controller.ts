/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import type { Announcement } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementStatusDto } from './dto/update-announcement-status.dto';

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  create(@Body() dto: CreateAnnouncementDto): Announcement {
    return this.announcementService.create(dto.title, dto.description);
  }

  @Get()
  findAll(): Announcement[] {
    // This route is correct
    return this.announcementService.findAll();
  }

  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementStatusDto,
  ): Announcement {
    return this.announcementService.updateStatus(id, dto.status);
  }
}