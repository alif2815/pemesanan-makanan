import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('/api/reports')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get('transaction')
  @UseGuards(JwtGuard)
  async transactions(@Query('start') start?: string, @Query('end') end?: string) {
    return this.reportService.transactionsReport(start, end);
  }
}
