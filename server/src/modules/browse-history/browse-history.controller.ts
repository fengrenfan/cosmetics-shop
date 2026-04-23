import { Controller, Get, Post, Delete, Body, Query, Request } from '@nestjs/common';
import { BrowseHistoryService } from './browse-history.service';

@Controller('browse-history')
export class BrowseHistoryController {
  constructor(private readonly browseHistoryService: BrowseHistoryService) {}

  @Post('add')
  async add(@Body() body: { product_id: number }, @Request() req) {
    await this.browseHistoryService.addOrUpdate(req.user.id, body.product_id);
    return { code: 0, message: 'success' };
  }

  @Get('list')
  async getList(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ) {
    const result = await this.browseHistoryService.getList(
      req.user.id,
      parseInt(page),
      parseInt(pageSize),
    );
    return { code: 0, message: 'success', data: result };
  }

  @Delete('clear')
  async clear(@Request() req) {
    await this.browseHistoryService.clear(req.user.id);
    return { code: 0, message: 'success' };
  }

  @Delete('delete')
  async delete(@Request() req, @Query('product_id') productId: string) {
    await this.browseHistoryService.delete(req.user.id, parseInt(productId));
    return { code: 0, message: 'success' };
  }
}
