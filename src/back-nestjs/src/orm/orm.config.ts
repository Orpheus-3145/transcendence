import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// A static TypeORM configuration option.
export const ormConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
	// 'postgres' for PostgreSQL.
	type: 'postgres',
	host: configService.get<string>('POSTGRES_HOST'),
	port: configService.get<number>('PORT_POSTGRES', 5432),
	username: configService.get<string>('POSTGRES_USER'),
	password: configService.get<string>('POSTGRES_PASSWORD'),
	database: configService.get<string>('POSTGRES_DB'),
	// Entity types folder for database
	entities: [__dirname + '/entities/*.entity.ts'],
	// If set to true, TypeORM will synchronize the database schema with the current entity models at runtime.
	synchronize: true,
});