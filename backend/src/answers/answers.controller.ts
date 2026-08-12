import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('answers')
@UseGuards(JwtAuthGuard)
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() createAnswerDto: CreateAnswerDto) {
    return this.answersService.create(userId, createAnswerDto);
  }

  @Get('question/:questionId')
  findAllForQuestion(@GetUser('id') userId: string, @Param('questionId') questionId: string) {
    return this.answersService.findAllForQuestion(userId, questionId);
  }

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.answersService.findAll(userId);
  }
}
