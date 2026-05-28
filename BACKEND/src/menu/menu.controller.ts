import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto } from './dto';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('/api/menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  /**
   * GET /menu
   * Public endpoint: Get all menus
   * Query params:
   *   - all=true (default): Show all menus including unavailable
   *   - all=false: Show only available menus
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('all') all?: string) {
    const showUnavailable = all !== 'false';
    return this.menuService.findAll(showUnavailable);
  }

  /**
   * GET /menu/category/:category
   * Public endpoint: Get menus by category
   */
  @Get('category/:category')
  @HttpCode(HttpStatus.OK)
  async findByCategory(@Param('category') category: string) {
    return this.menuService.findByCategory(category);
  }

  /**
   * GET /menu/:id
   * Public endpoint: Get single menu by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  /**
   * POST /menu
   * Admin-only: Create new menu
   * Body: { nama, harga, deskripsi?, category, imageURL?, isAvailable?, stock? }
   */
  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  /**
   * PUT /menu/:id
   * Admin-only: Update menu
   * Body: { nama?, harga?, deskripsi?, category?, imageURL?, isAvailable?, stock? }
   */
  @Put(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menuService.update(id, updateMenuDto);
  }

  /**
   * DELETE /menu/:id
   * Admin-only: Delete menu
   */
  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.menuService.delete(id);
  }
}
