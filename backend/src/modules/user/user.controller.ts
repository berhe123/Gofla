import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async me(@CurrentUser('id') userId: string) {
    const user = await this.userService.findById(userId);
    return this.userService.toProfile(user);
  }

  @Patch('me')
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(userId, dto);
  }

  @Get('me/addresses')
  listAddresses(@CurrentUser('id') userId: string) {
    return this.userService.listAddresses(userId);
  }

  @Post('me/addresses')
  createAddress(@CurrentUser('id') userId: string, @Body() dto: CreateAddressDto) {
    return this.userService.createAddress(userId, dto);
  }

  @Patch('me/addresses/:id')
  updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.userService.updateAddress(userId, id, dto);
  }

  @Delete('me/addresses/:id')
  deleteAddress(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.userService.deleteAddress(userId, id);
  }
}
