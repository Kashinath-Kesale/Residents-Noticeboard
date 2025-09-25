import { IsIn } from 'class-validator';

export class UpdateAnnouncementStatusDto {
  @IsIn(['active', 'closed'], { message: 'Status must be either active or closed' })
  status: 'active' | 'closed';
}