import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('/api/transaction')
export class TransactionController {
  constructor(private txService: TransactionService) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    return this.txService.create(dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  async findAll() {
    return this.txService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(@Param('id') id: string) {
    return this.txService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.txService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(@Param('id') id: string) {
    return this.txService.remove(id);
  }
}
