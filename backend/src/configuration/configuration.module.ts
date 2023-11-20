import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
})
export class ConfigurationModule {}
