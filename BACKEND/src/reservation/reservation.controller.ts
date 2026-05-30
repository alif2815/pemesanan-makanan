import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('/api/reservation')
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Post()
  async create(@Body() dto: CreateReservationDto) {
    return this.reservationService.create(dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  async findAll() {
    return this.reservationService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(@Param('id') id: string) {
    return this.reservationService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.reservationService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(@Param('id') id: string) {
    return this.reservationService.remove(id);
  }
}
