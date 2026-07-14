import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { StudioService } from './studio.service';
import { StorageService } from '../../infra/storage/storage.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('studio')
@Controller()
export class StudioController {
  constructor(
    private readonly studio: StudioService,
    private readonly storage: StorageService,
  ) {}

  @Public()
  @Post('search/visual')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async visual(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('color') color?: string,
    @Body('category') category?: string,
  ) {
    let storedImageUrl: string | undefined;
    if (file) {
      try {
        storedImageUrl = await this.storage.upload(file.buffer, file.originalname, 'studio');
      } catch {
        // Upload storage can fail on ephemeral hosts — search still works without persisting the file.
      }
    }
    return this.studio.visualSearch({ color, category, storedImageUrl });
  }

  @Public()
  @Get('search/visual')
  visualGet(@Query('color') color?: string, @Query('category') category?: string) {
    return this.studio.visualSearch({ color, category });
  }

  @Public()
  @Get('products/:id/complete-the-look')
  completeTheLook(@Param('id') id: string) {
    return this.studio.completeTheLook(id);
  }

  @Public()
  @Get('studio/live-drops')
  liveDrops() {
    return this.studio.liveDrops();
  }
}
