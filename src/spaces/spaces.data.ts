export type SpaceDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface ScheduledShow {
    id: string;
    title: string;
    state: string;
    scheduledStart: string;
}

export interface Space {
  host: string;
  hostAvatar: string;
  twitter: string;
  handle: string;
  name: string;
  day: SpaceDay;
  timePST: string;
  timeEST: string;
  timeBST: string;
  timeAEST: string;
  timeKST: string;
}

export const spaces: Space[] = [
    {
      host: 'Ollie',
      hostAvatar: 'https://froggyfriends.mypinata.cloud/ipfs/QmdJoB8xdVieoCxgh34mF23TA6RFqdEZ1aRHZBcm1zVi7W',
      twitter: 'https://twitter.com/ollliieeeeee',
      handle: 'ollliieeeeee',
      name: 'Ollies Space',
      day: 'Wednesday',
      timePST: '1pm PST',
      timeEST: '4pm EST',
      timeBST: '9pm BST',
      timeAEST: '8am AEDT (Tue)',
      timeKST: '6am KST (Tue)'
    },
    {
      host: 'Bek',
      hostAvatar: 'https://froggyfriends.mypinata.cloud/ipfs/Qmakmum943LT7Brf1C6G9rVoswhUZk65Renyav2zfPB5s2',
      twitter: 'https://twitter.com/SleepyBek',
      handle: 'SleepyBek',
      name: 'Late Night with Bek',
      day: 'Monday',
      timePST: '1pm PST',
      timeEST: '4pm EST',
      timeBST: '9pm BST',
      timeAEST: '8am AEDT (Tue)',
      timeKST: '6am KST (Tue)'
    },
    {
      host: 'Fonzy',
      hostAvatar: 'https://froggyfriends.mypinata.cloud/ipfs/QmXMsHpgPJ47mL9Wjt4Ld8hmHrZhCcvk4Kcxpxx3HTRZE3',
      twitter: 'https://twitter.com/0xFonzy',
      handle: '0xFonzy',
      name: 'Froggy Friday',
      day: 'Friday',
      timePST: '9am PST',
      timeEST: '12pm EST',
      timeBST: '5pm BST',
      timeAEST: '4am AEDT (Sat)',
      timeKST: '2am KST (Sat)'
    }
  ]