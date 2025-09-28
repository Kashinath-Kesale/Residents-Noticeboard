/* eslint-disable prettier/prettier */
import { IsIn } from 'class-validator';
// --- FIX: Changed to 'import type' ---
import type { ReactionType } from '../announcement.service';

const validReactions: ReactionType[] = ['up', 'down', 'heart'];

export class CreateReactionDto {
  @IsIn(validReactions)
  type: ReactionType;
}