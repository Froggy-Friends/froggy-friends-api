import { Froggy } from './Froggy';
export interface OwnedResponse {
  froggies: Froggy[];
  totalRibbit: number;
  allowance: number;
  isStakingApproved: boolean;
}