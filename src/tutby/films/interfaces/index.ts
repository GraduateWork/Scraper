import { BaseEvent } from '../../../interfaces';

export interface Film extends BaseEvent  {
  genres: string;
  year: string;
  countries: string;
  duration: string;
  director: string;
  cast: string;
  rating: string;
}
