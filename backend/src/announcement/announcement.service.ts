/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

// --- Type Definitions ---
export type Status = 'active' | 'closed';
export type ReactionType = 'up' | 'down' | 'heart';

export interface Announcement {
  id: string;
  title: string;
  description?: string;
  status: Status;
  createdAt: string;
}
export interface Comment {
  id: string;
  announcementId: string;
  authorName: string;
  text: string;
  createdAt: Date;
}
export interface Reaction {
  id: string;
  announcementId: string;
  userId: string;
  type: ReactionType;
}
export type AnnouncementWithCounts = Announcement & {
  commentCount: number;
  reactions: Record<ReactionType, number>;
  lastActivityAt: string;
};

@Injectable()
export class AnnouncementService {
  private announcements: Announcement[] = [];
  private comments: Comment[] = []; // In-memory store for comments
  private reactions: Reaction[] = []; // In-memory store for reactions
  private readonly idempotencyCache = new Map<string, { response: any; expiry: number }>();

  // --- Announcement Methods ---
  create(title: string, description?: string): Announcement {
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title,
      description,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.announcements.push(newAnnouncement);
    return newAnnouncement;
  }

  findAll(): AnnouncementWithCounts[] {
    const sortedAnnouncements = [...this.announcements].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return sortedAnnouncements.map((announcement) => {
      const commentCount = this.comments.filter(
        (c) => c.announcementId === announcement.id,
      ).length;

      const announcementReactions = this.reactions.filter(
        (r) => r.announcementId === announcement.id,
      );
      const reactions: Record<ReactionType, number> = { up: 0, down: 0, heart: 0 };
      announcementReactions.forEach((r) => { reactions[r.type]++; });

      const lastComment = this.comments
        .filter((c) => c.announcementId === announcement.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      
      const lastActivityAt = lastComment
        ? lastComment.createdAt.toISOString()
        : announcement.createdAt;

      return { ...announcement, commentCount, reactions, lastActivityAt };
    });
  }

  updateStatus(id: string, status: Status): Announcement {
    const announcement = this.announcements.find((a) => a.id === id);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID "${id}" not found`);
    }
    announcement.status = status;
    return announcement;
  }

  // --- Comment Methods ---
  addComment(announcementId: string, commentData: CreateCommentDto): Comment {
    const announcement = this.announcements.find((a) => a.id === announcementId);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID "${announcementId}" not found`);
    }
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      announcementId,
      authorName: commentData.authorName,
      text: commentData.text,
      createdAt: new Date(),
    };
    this.comments.push(newComment);
    return newComment;
  }

  getCommentsForAnnouncement(announcementId: string, paginationQuery: PaginationQueryDto): Comment[] {
    const { cursor, limit } = paginationQuery;

    const allComments = this.comments
      .filter((comment) => comment.announcementId === announcementId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (!cursor) {
      return allComments.slice(0, limit);
    }

    const cursorIndex = allComments.findIndex((c) => c.id === cursor);
    if (cursorIndex === -1) {
      return [];
    }

    const startIndex = cursorIndex + 1;
    return allComments.slice(startIndex, startIndex + limit);
  }

  // --- Reaction Methods ---
  addReaction(
    announcementId: string,
    userId: string,
    reactionData: CreateReactionDto,
    idempotencyKey?: string,
  ): Reaction {
    if (idempotencyKey) {
      const cached = this.idempotencyCache.get(idempotencyKey);
      if (cached && cached.expiry > Date.now()) {
        return cached.response as Reaction;
      }
    }

    const announcement = this.announcements.find((a) => a.id === announcementId);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID "${announcementId}" not found`);
    }
    
    const existingReaction = this.reactions.find(
      (r) => r.announcementId === announcementId && r.userId === userId,
    );

    let result: Reaction;
    if (existingReaction) {
      existingReaction.type = reactionData.type;
      result = existingReaction;
    } else {
      const newReaction: Reaction = {
        id: `reaction_${Date.now()}`,
        announcementId,
        userId,
        type: reactionData.type,
      };
      this.reactions.push(newReaction);
      result = newReaction;
    }

    if (idempotencyKey) {
      const expiry = Date.now() + 5 * 60 * 1000; // 5 minute expiry
      this.idempotencyCache.set(idempotencyKey, { response: result, expiry });
    }

    return result;
  }

  removeReaction(announcementId: string, userId: string): { message: string } {
    const initialLength = this.reactions.length;
    this.reactions = this.reactions.filter(
      (r) => !(r.announcementId === announcementId && r.userId === userId),
    );
    if (this.reactions.length === initialLength) {
      throw new NotFoundException('Reaction not found for this user and announcement.');
    }
    return { message: 'Reaction removed successfully' };
  }
}