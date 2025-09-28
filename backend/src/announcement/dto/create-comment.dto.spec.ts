/* eslint-disable prettier/prettier */
import { validate } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';

describe('CreateCommentDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateCommentDto();
    dto.authorName = 'John Doe';
    dto.text = 'This is a valid comment.';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if text is empty', async () => {
    const dto = new CreateCommentDto();
    dto.authorName = 'Jane Doe';
    dto.text = ''; // Invalid text

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation if text is too long', async () => {
    const dto = new CreateCommentDto();
    dto.authorName = 'Jane Doe';
    dto.text = 'a'.repeat(501); // Invalid: 501 characters

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    // FIX: The property key is 'isLength', not 'length'.
    expect(errors[0].constraints).toHaveProperty('isLength');
  });
});