export type SpaceDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface SpaceShow {
    id: string;
    title: string;
    state: string;
    scheduledStart: string;
}

export interface SpaceTimes {
  pst: string;
  est: string;
  bst: string;
  aest: string;
  kst: string;
}

export interface SpaceHost {
  name: string;
  avatar: string;
  twitterUrl: string;
  twitterHandle: string;
}

export interface Space {
  name: string;
  host: SpaceHost;
  day: SpaceDay;
  times: SpaceTimes;
  scheduledShows: SpaceShow[];
}