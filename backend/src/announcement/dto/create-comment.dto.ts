/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  authorName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500) // Validation rule for 1-500 characters
  text: string;
}