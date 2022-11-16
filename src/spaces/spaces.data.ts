import { Space } from "./spaces.models";

export const spaces: Space[] = [
    {
      name: 'Ollies Space',
      host: {
        name: 'Ollie',
        avatar: 'https://froggyfriends.mypinata.cloud/ipfs/QmdJoB8xdVieoCxgh34mF23TA6RFqdEZ1aRHZBcm1zVi7W',
        twitterUrl: 'https://twitter.com/ollliieeeeee',
        twitterHandle: 'ollliieeeeee',
      },
      times: {
        pst: '1pm PST',
        est: '4pm EST',
        bst: '9pm BST',
        aest: '8am AEDT (Tue)',
        kst: '6am KST (Tue)'
      },
      day: 'Wednesday',
      shows: []
    },
    {
      name: 'Late Night with Bek',
      host: {
        name: 'Bek',
        avatar: 'https://froggyfriends.mypinata.cloud/ipfs/Qmakmum943LT7Brf1C6G9rVoswhUZk65Renyav2zfPB5s2',
        twitterUrl: 'https://twitter.com/SleepyBek',
        twitterHandle: 'SleepyBek',
      },
      times: {
        pst: '1pm PST',
        est: '4pm EST',
        bst: '9pm BST',
        aest: '8am AEDT (Tue)',
        kst: '6am KST (Tue)'
      },
      day: 'Monday',
      shows: []
    },
    {
      name: 'Froggy Friday',
      host: {
        name: 'Fonzy',
        avatar: 'https://froggyfriends.mypinata.cloud/ipfs/QmXMsHpgPJ47mL9Wjt4Ld8hmHrZhCcvk4Kcxpxx3HTRZE3',
        twitterUrl: 'https://twitter.com/0xFonzy',
        twitterHandle: '0xFonzy',
      },
      day: 'Friday',
      times: {
        pst: '9am PST',
        est: '12pm EST',
        bst: '5pm BST',
        aest: '4am AEDT (Sat)',
        kst: '2am KST (Sat)'
      },
      shows: []
    }
  ]