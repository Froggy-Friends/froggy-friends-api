export interface ItemRequest {
  admin: string;
  message: string;
  signature: string;
  item: {
    name: string;
    description: string;
    category: string;
    twitter: string;
    discord: string;
    website: string;
    endDate: number;
    collabId: number;
    isCommunity: boolean;
    isBoost: boolean;
    isTrait: boolean;
    isPhysical: boolean;
    isAllowlist: boolean;
    rarity: string;
    boost: number;
    friendOrigin: string;
    traitLayer: string;
    price: number;
    percent: number;
    minted: number;
    supply: number;
    walletLimit: number;
    isOnSale: boolean;
  }
}