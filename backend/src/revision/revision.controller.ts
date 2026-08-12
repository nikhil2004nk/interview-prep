import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { RevisionService } from './revision.service';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { ReviewItemDto } from './dto/review-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';

@Controller('revision')
@UseGuards(JwtAuthGuard)
export class RevisionController {
  constructor(private readonly revisionService: RevisionService) {}

  @Post()
  create(@GetUser() user: User, @Body() createRevisionDto: CreateRevisionDto) {
    return this.revisionService.create(user, createRevisionDto);
  }

  @Get('due')
  findDue(@GetUser('id') userId: string) {
    return this.revisionService.findDue(userId);
  }

  @Post(':id/review')
  review(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() reviewItemDto: ReviewItemDto,
  ) {
    return this.revisionService.review(userId, id, reviewItemDto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.revisionService.remove(userId, id);
  }
}
