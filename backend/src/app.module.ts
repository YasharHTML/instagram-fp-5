import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [ConfigurationModule, AuthModule],
})
export class AppModule {}
