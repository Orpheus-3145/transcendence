import { Module, forwardRef } from '@nestjs/common';

import InvitationController from 'src/game/invitation/invitation.controller';
import InvitationService from 'src/game/invitation/invitation.service';
import ExceptionModule from 'src/errors/exception.module';
import AppLoggerModule from 'src/log/log.module';
import RoomManagerModule from 'src/game/session/roomManager.module';

@Module({
  imports: [AppLoggerModule, RoomManagerModule, forwardRef(() => ExceptionModule)],
  providers: [InvitationController, InvitationService],
  exports: [InvitationService],
})
export default class InvitationModule {}
