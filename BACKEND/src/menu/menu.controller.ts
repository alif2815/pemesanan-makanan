import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  // Public: customer gets all active/available menus
  @Get()
  async findAll(@Query('all') all?: string) {
    const showUnavailable = all !== 'false';
    return this.menuService.findAll(showUnavailable);
  }

  // Public: view a single menu details
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  // Admin-only CRUD operations
  @Post()
  @UseGuards(JwtGuard)
  async create(@Body() body: any) {
    return this.menuService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.menuService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async delete(@Param('id') id: string) {
    return this.menuService.delete(id);
  }
}
