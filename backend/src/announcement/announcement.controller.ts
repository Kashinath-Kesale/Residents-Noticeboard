/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Patch, Post, Headers, Delete, HttpCode, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import type { Announcement } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementStatusDto } from './dto/update-announcement-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import type { Request, Response } from 'express';
import * as crypto from 'crypto';
import { Throttle } from '@nestjs/throttler';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  // --- Main Announcement Endpoints ---

  @Post()
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiResponse({ status: 201, description: 'The announcement has been successfully created.', type: CreateAnnouncementDto })
  create(@Body() dto: CreateAnnouncementDto): Announcement {
    return this.announcementService.create(dto.title, dto.description);
  }

  @Get()
  @ApiOperation({ summary: 'Get all announcements with engagement counts' })
  @ApiResponse({ status: 200, description: 'Returns a list of announcements.' })
  @ApiResponse({ status: 304, description: 'Not Modified. Client has the latest version.' })
  findAll(@Req() req: Request, @Res() res: Response) {
    const announcements = this.announcementService.findAll();
    const etag = crypto.createHash('md5').update(JSON.stringify(announcements)).digest('hex');

    if (req.headers['if-none-match'] === etag) {
      return res.status(HttpStatus.NOT_MODIFIED).send();
    }

    res.setHeader('ETag', etag);
    return res.status(HttpStatus.OK).json(announcements);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update the status of an announcement' })
  @ApiParam({ name: 'id', description: 'The ID of the announcement' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementStatusDto,
  ): Announcement {
    return this.announcementService.updateStatus(id, dto.status);
  }

  // --- Comment Endpoints ---

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to an announcement' })
  @ApiParam({ name: 'id', description: 'The ID of the announcement' })
  @ApiResponse({ status: 201, description: 'The comment has been successfully created.' })
  @ApiResponse({ status: 404, description: 'Announcement not found.' })
  addCommentToAnnouncement(
    @Param('id') announcementId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.announcementService.addComment(announcementId, createCommentDto);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get paginated comments for an announcement' })
  @ApiParam({ name: 'id', description: 'The ID of the announcement' })
  getComments(
    @Param('id') announcementId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.announcementService.getCommentsForAnnouncement(
      announcementId,
      paginationQuery,
    );
  }

  // --- Reaction Endpoints ---

  @Post(':id/reactions')
  @ApiOperation({ summary: 'Add or update a reaction to an announcement' })
  @ApiParam({ name: 'id', description: 'The ID of the announcement' })
  @ApiHeader({ name: 'x-user-id', description: 'Unique identifier for the user', required: true })
  @ApiHeader({ name: 'idempotency-key', description: 'Unique key to prevent duplicate requests', required: false })
  addReaction(
    @Param('id') announcementId: string,
    @Headers('x-user-id') userId: string,
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return this.announcementService.addReaction(
      announcementId,
      userId,
      createReactionDto,
      idempotencyKey,
    );
  }

  @Delete(':id/reactions')
  @ApiOperation({ summary: "Remove a user's reaction from an announcement" })
  @ApiParam({ name: 'id', description: 'The ID of the announcement' })
  @ApiHeader({ name: 'x-user-id', description: 'Identifier for the user whose reaction will be removed', required: true })
  @HttpCode(HttpStatus.OK)
  removeReaction(
    @Param('id') announcementId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.announcementService.removeReaction(announcementId, userId);
  }
}