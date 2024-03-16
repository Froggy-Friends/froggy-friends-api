import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule } from './rule.entity';

@Injectable()
export class RuleService {
  constructor(@InjectRepository(Rule) private ruleRepo: Repository<Rule>) {}

  async getRule(id: number): Promise<Rule> {
    return await this.ruleRepo.findOneBy({ id: id });
  }

  async save(rule: Rule) {
    return await this.ruleRepo.save(rule);
  }

  async getCount(): Promise<number> {
    return await this.ruleRepo.count();
  }

  async getAllRules(): Promise<Rule[]> {
    const [rules] = await this.ruleRepo.findAndCount();
    return rules.sort((a, b) => a.id - b.id);
  }

  async getLastRuleId(): Promise<number> {
    const [rules] = await this.ruleRepo.findAndCount();
    if (rules.length) {
      const sortedRules = rules.sort((a, b) => a.id - b.id);
      return sortedRules[sortedRules.length - 1].id;
    } else {
      return rules.length;
    }
  }

  async deleteRules(traitId: number) {
    return await this.ruleRepo.delete({ traitId: traitId });
  }
}
