import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { GetUser } from './common/decorators/get-user.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('dashboard/metrics')
  @UseGuards(JwtAuthGuard)
  getMetrics(@GetUser('id') userId: string) {
    return this.appService.getDashboardMetrics(userId);
  }
}
