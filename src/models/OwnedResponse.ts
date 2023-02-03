import { Frog } from "src/frog/frog.entity";

export interface OwnedResponse {
  froggies: Frog[];
  totalRibbit: number;
  allowance: number;
  isStakingApproved: boolean;
}