import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.notificationService.list(userId);
  }

  @Patch('read-all')
  readAll(@CurrentUser('id') userId: string) {
    return this.notificationService.markAllRead(userId);
  }

  @Patch(':id/read')
  read(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationService.markRead(userId, id);
  }
}
