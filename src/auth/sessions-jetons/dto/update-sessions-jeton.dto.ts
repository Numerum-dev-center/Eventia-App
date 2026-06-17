import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionsJetonDto } from './create-sessions-jeton.dto';

export class UpdateSessionsJetonDto extends PartialType(CreateSessionsJetonDto) {}
