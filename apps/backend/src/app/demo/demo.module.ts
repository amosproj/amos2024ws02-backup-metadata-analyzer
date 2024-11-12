import {Module} from '@nestjs/common';
import {DemoService} from "./demo.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DemoEntity} from "./entity/demo.entity";
import {DemoController} from "./demo.controller";

@Module({
    providers: [DemoService],
    imports: [
        TypeOrmModule.forFeature([DemoEntity]),
    ],
    controllers: [DemoController],
    exports: [DemoService],
})
export class DemoModule {
}