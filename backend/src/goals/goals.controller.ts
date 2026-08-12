import { Controller, Get, Post, Patch, Param, Delete, Body, UseGuards } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(@GetUser() user: User, @Body() createGoalDto: CreateGoalDto) {
    return this.goalsService.create(user, createGoalDto);
  }

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.goalsService.findAll(userId);
  }

  @Patch(':id/toggle')
  toggle(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.goalsService.toggle(userId, id);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.goalsService.remove(userId, id);
  }
}
