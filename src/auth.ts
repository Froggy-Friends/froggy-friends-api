import { BadRequestException } from '@nestjs/common';
import { hashMessage, recoverAddress } from 'ethers';
import { TraitUpgradeRequest } from './models/TraitUpgradeRequest';

interface UpgradeData {
  account: string;
  transaction: string;
  frogId: number;
  traitId: number;
}

export const isTraitUpgradeAuthenticated = (
  request: TraitUpgradeRequest,
  owner: string,
) => {
  const { message, signature, account, transaction } = request;
  const signer = recoverAddress(hashMessage(message), signature);
  const data: UpgradeData = JSON.parse(message);

  // confirm ownership of frog
  if (
    signer.toLowerCase() !== account.toLowerCase() ||
    signer.toLowerCase() !== data.account.toLowerCase() ||
    signer.toLowerCase() !== owner.toLowerCase()
  ) {
    throw new BadRequestException('Account does not match');
  }

  // confirm signature data matches request data
  if (
    data.frogId !== request.frogId ||
    data.traitId !== request.traitId ||
    data.transaction.toLowerCase() !== transaction.toLowerCase()
  ) {
    throw new BadRequestException('Account data does not match');
  }
  return true;
};
