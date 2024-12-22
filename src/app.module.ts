import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileModule } from './profile/profile.module';
import { OrderModule } from './order/order.module';
import { ShoppingListModule } from './shoppinglist/shoppinglist.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: '12345678',
      username: 'postgres',
      entities: [__dirname + '/../**/*.entity.js'], // Include all entities
      database: 'codyssey',
      synchronize: true
    }),
    AuthModule, 
    UserModule,
    ProfileModule,
    OrderModule,
    ShoppingListModule,
    StatsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}