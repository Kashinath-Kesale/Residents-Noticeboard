/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';

export type Status = 'active' | 'closed';

export interface Announcement {
  id: string;
  title: string;
  description?: string;
  status: Status;
  createdAt: string;
}

@Injectable()
export class AnnouncementService {
  private announcements: Announcement[] = [];

  create(title: string, description?: string): Announcement {
    const announcement: Announcement = {
      id: Date.now().toString(),
      title,
      description,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.announcements.push(announcement);
    return announcement;
  }

  findAll(): Announcement[] {
    return [...this.announcements].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  updateStatus(id: string, status: Status): Announcement {
    const announcement = this.announcements.find((a) => a.id === id);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID "${id}" not found`);
    }
    announcement.status = status;
    return announcement;
  }
}