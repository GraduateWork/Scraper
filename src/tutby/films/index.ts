import { Browser, Page } from 'puppeteer';

import { Film } from './interfaces';
import { BaseEvent } from '../../interfaces';

export default class FilmsScraper {
  private url: string;

  constructor(private browser: Promise<Browser>) {
    this.url = 'https://afisha.tut.by/film';
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
        const title = document.querySelector('#event-name');
        return title ? (title.textContent as string).toString().trim() : '';
      };

      const getEndTime = () => {
        const endDate = document.querySelector('.date');
        return endDate ? endDate.textContent as string : '';
      };

      const getImgSrc = () => {
        const imgSrc = document.querySelector('.main_image');
        return imgSrc ? (imgSrc as HTMLImageElement).src : '';
      };

      const getDescription = () => {
        // description doesn't have a tag
        const descriptionElement = document.querySelector('#event-description');
        let description = '';
        if (descriptionElement) {
          if (descriptionElement.childNodes.length >= 2) {
            description = descriptionElement.childNodes[2].textContent ?
              descriptionElement.childNodes[2].textContent.trim() :
              '';
          }
        }
        return description;
      };

      const baseEvent = {
        type: 'film',
        source,
        title: getTitle(),
        startTime: '',
        endTime: getEndTime(),
        imgSrc: getImgSrc(),
        description: getDescription(),
      } as BaseEvent;

      // FILM

      const getGenres = () => {
        const genresElements = document.querySelectorAll('.genre > p > a');
        const genres: string[] = [];
        genresElements.forEach(genre => {
          genres.push(genre.textContent as string);
        });
        return genres.length >= 1 ? genres.join(', ') : '';
      };

      const getYear = () => {
        const year = document.querySelector('.year');
        return year ? year.textContent as string : '';
      };

      const getCountries = () => {
        const countries = document.querySelector('table.movie_info > tbody > tr > td.author');
        return countries ? countries.textContent as string : '';
      };

      const getDuration = () => {
        const duration = document.querySelector('.duration');
        return duration ? duration.textContent as string : '';
      };

      const getDirector = () => {
        const director = document.querySelector('td.post.b-event-post > p:first-of-type');
        return director ? director.textContent as string : '';
      };

      const getCast = () => {
        const cast = document.querySelector('td.post.b-event-post > p:last-of-type');
        return cast ? cast.textContent as string : '';
      };

      const getRating = () => {
        const rating = document.querySelector('.IMDb > b');
        return rating ? rating.textContent as string : '';
      };

      return Object.assign(baseEvent, {
        genres: getGenres(),
        year: getYear(),
        countries: getCountries(),
        duration: getDuration(),
        director: getDirector(),
        cast: getCast(),
        rating: getRating(),
      } as Film);
    }, link);
    return film;
  }

  private async getLinks(): Promise<string[]> {
    const page = await (await this.browser).newPage();
    await page.goto(this.url);
    const links = await page.$$eval('#events-block > ul > li > a.name', (elements) => {
      return elements.map(a => {
        const href = (a as HTMLAnchorElement).href;
        return href;
      });
    });
    await page.close();
    return links;
  }
}
