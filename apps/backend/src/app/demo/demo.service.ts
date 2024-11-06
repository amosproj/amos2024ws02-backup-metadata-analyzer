import {Injectable,} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {DemoEntity} from "./entity/demo.entity";
import {Repository} from "typeorm";

@Injectable()
export class DemoService {
    constructor(
        @InjectRepository(DemoEntity)
        private demoRepository: Repository<DemoEntity>,
    ) {
    }

    /**
     * Find one entry by id.
     * @param id
     */
    async findOneById(id: string): Promise<DemoEntity | null> {
        return this.demoRepository.findOne({where: {id: id}});
    }

    /**
     * Create a new entry.
     * @param text
     */
    async createEntry(text: string): Promise<DemoEntity> {
        const entry = new DemoEntity();
        entry.text = text;
        return this.demoRepository.save(entry);
    }
}
