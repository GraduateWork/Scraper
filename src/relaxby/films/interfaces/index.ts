import { BaseEvent } from '../../../interfaces';

export interface Film extends BaseEvent  {
  originalName: string;
  genres: string;
  year: string;
  countries: string;
  duration: string;
  director: string;
  producer: string;
  cast: string;
  rating: string;
  ageLimit: string;
}
