import { Controller, Get } from "@nestjs/common";

import { AppService } from "./app.service";
import {ApiOperation} from "@nestjs/swagger";

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@ApiOperation({
		summary: "Dummy Endpoint for testing basic setup",
	})
	@Get('data')
	getData() {
		return this.appService.getData();
	}
}
