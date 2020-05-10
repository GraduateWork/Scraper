import { Browser, Page } from 'puppeteer';

import { Film } from './interfaces';
import { BaseEvent } from '../../interfaces';

export default class FilmsScraper {
  private url: string;

  constructor(private browser: Promise<Browser>) {
    this.url = 'https://afisha.relax.by/kino/minsk';
  }

  public async getData(): Promise<Film[]> {
    const links = await this.getLinks();
    const page = await (await this.browser).newPage();
    const films: Film[] = [];
    for (const link of links) {
      const film = await this.getFilm(link, page);
      films.push(film);
    }
    await page.close();
    return films;
  }

  private async getFilm(link: string, page: Page): Promise<Film> {
    await page.goto(link, { waitUntil: 'domcontentloaded' });
    const film = await page.evaluate((source: string) => {
      // BASE EVENT

      const getTitle = () => {
        const title = document.querySelector('.b-afisha-layout-theater_movie-title');
        return title ? (title.textContent as string).trim() : '';
      };

      const getStartTime = () => {
        const startTime = document.querySelector('.b-afisha_cinema_description_table [itemprop="datePublished"]');
        return startTime ? (startTime.textContent as string).trim() : '';
      };

      const getImgSrc = () => {
        const imgSrc = document.querySelector('.b-afisha-event__image');
        return imgSrc ? (imgSrc as HTMLImageElement).src : '';
      };

      const getDescription = () => {
        const description = document.querySelector('.b-afisha_cinema_description_text p');
        return description ? description.textContent as string : '';
      };

      const baseEvent = {
        type: 'film',
        source,
        title: getTitle(),
        startTime: getStartTime(),
        endTime: '',
        imgSrc: getImgSrc(),
        description: getDescription(),
      } as BaseEvent;

      // FILM

      const getOriginalName = () => {
        const originalName = document.querySelector('.b-afisha_cinema_description_table [itemprop="alternativeHeadline"]');
        return originalName ? (originalName.textContent as string).trim() : '';
      };

      const getGenres = () => {
        const genres: string[] = [];
        const tablesElements = document.querySelectorAll('.b-afisha_cinema_description_table tr');
        tablesElements.forEach(tableElement => {
          const key = tableElement.querySelector('.b-afisha_cinema_description_table_name') as Element;
          if ((key.textContent as string).trim().toLocaleLowerCase() === 'Жанр'.toLocaleLowerCase()) {
            const value = tableElement.querySelector('.b-afisha_cinema_description_table_desc') as Element;
            const tempGenres = (value.textContent as string).split(',');
            tempGenres.forEach(genre => {
              genres.push(genre.trim());
            });
          }
        });
        return genres.length >= 1 ? genres.join(', ') : '';
      };

      const getYear = () => {
        let year = '';
        const tablesElements = document.querySelectorAll('.b-afisha_cinema_description_table tr');
        tablesElements.forEach(tableElement => {
          const key = tableElement.querySelector('.b-afisha_cinema_description_table_name') as Element;
          if ((key.textContent as string).trim().toLocaleLowerCase() === 'Год'.toLocaleLowerCase()) {
            const value = tableElement.querySelector('.b-afisha_cinema_description_table_desc') as Element;
            year = (value.textContent as string).trim();
          }
        });
        return year;
      };

      const getCountries = () => {
        const countries: string[] = [];
        const tablesElements = document.querySelectorAll('.b-afisha_cinema_description_table tr');
        tablesElements.forEach(tableElement => {
          const key = tableElement.querySelector('.b-afisha_cinema_description_table_name') as Element;
          if ((key.textContent as string).trim().toLocaleLowerCase() === 'Страна'.toLocaleLowerCase()) {
            const value = tableElement.querySelector('.b-afisha_cinema_description_table_desc') as Element;
            const tempCountries = (value.textContent as string).split(',');
            tempCountries.forEach(country => {
              countries.push(country.trim());
            });
          }
        });
        return countries.length >= 1 ? countries.join(', ') : '';
      };

      const getDuration = () => {
        const duration = document.querySelector('.b-afisha_cinema_description_table [itemprop="duration"]');
        return duration ? (duration.textContent as string).trim() : '';
      };

      const getDirector = () => {
        const directors: string[] = [];
        const allDirectors = document.querySelector('.b-afisha_cinema_description_table [itemprop="director"]');
        if (allDirectors) {
          const tempDirectors = (allDirectors.textContent as string).split(',');
          tempDirectors.forEach(director => {
            directors.push(director.trim());
          });
        }
        return directors.length >= 1 ? directors.join(', ') : '';
      };

      const getProducer = () => {
        const producers: string[] = [];
        const allProducers = document.querySelector('.b-afisha_cinema_description_table [itemprop="producer"]');
        if (allProducers) {
          const tempProducers = (allProducers.textContent as string).split(',');
          tempProducers.forEach(producer => {
            producers.push(producer.trim());
          });
        }
        return producers.length >= 1 ? producers.join(', ') : '';
      };

      const getCast = () => {
        const cast: string[] = [];
        const allCast = document.querySelector('.b-afisha_cinema_description_table [itemprop="actors"]');
        if (allCast) {
          const tempCast = (allCast.textContent as string).split(',');
          tempCast.forEach(actor => {
            cast.push(actor.trim());
          });
        }
        return cast.length >= 1 ? cast.join(', ') : '';
      };

      const getAgeLimit = () => {
        let ageLimit = '';
        const tablesElements = document.querySelectorAll('.b-afisha_cinema_description_table tr');
        tablesElements.forEach(tableElement => {
          const key = tableElement.querySelector('.b-afisha_cinema_description_table_name') as Element;
          if ((key.textContent as string).trim().toLocaleLowerCase() === 'Возрастное ограничение'.toLocaleLowerCase()) {
            const value = tableElement.querySelector('.b-afisha_cinema_description_table_desc') as Element;
            ageLimit = (value.textContent as string).trim();
          }
        });
        return ageLimit;
      };

      return Object.assign(baseEvent, {
        originalName: getOriginalName(),
        genres: getGenres(),
        year: getYear(),
        countries: getCountries(),
        duration: getDuration(),
        director: getDirector(),
        producer: getProducer(),
        cast: getCast(),
        rating: '',
        ageLimit: getAgeLimit(),
      } as Film);
    }, link);
    return film;
  }

  private async getLinks(): Promise<string[]> {
    const page = await (await this.browser).newPage();
    await page.goto(this.url);
    const links = await page.$$eval('.schedule__event-link.link', (elements) => {
      return elements.map(a => {
        const href = (a as HTMLAnchorElement).href;
        return href;
      });
    });
    await page.close();
    return [...new Set(links)];
  }
}
