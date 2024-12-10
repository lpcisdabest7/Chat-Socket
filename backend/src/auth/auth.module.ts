import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenModule } from '@libs/modules';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule, TokenModule ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
