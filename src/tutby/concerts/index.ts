import { launch, Browser, Page } from 'puppeteer';
import { Concert } from './interfaces';

export default class ConcertsScraper {
  private browser: Promise<Browser>;
  private url: string;

  constructor() {
    this.browser = launch();
    this.url = 'https://afisha.tut.by/concert';
  }

  public async getData() {
    const links = await this.getLinks();
    const page = await (await this.browser).newPage();
    const concerts: Concert[] = [];
    for (const link of links) {
      const concert = await this.getConcert(link, page);
      console.log(concert);
      concerts.push(concert);
    }
    page.close();
    return concerts;
  }

  private async getConcert(link: string, page: Page) {
    await page.goto(link, { waitUntil: 'domcontentloaded' });
    const concert = await page.evaluate(() => {
      const getTitle = () => {
        const title = document.querySelector('#event-name');
        return title ? (title.textContent as string).toString().trim() : '';
      }

      return {
        title: getTitle(),
      } as Concert;
    });
    return concert;
  }

  private async getLinks(): Promise<string[]> {
    const page = await (await this.browser).newPage();
    await page.goto(this.url);
    const links = await page.$$eval('.js-film-list-wrapper a.header__link', (elements) => {
      return elements.map((a) => {
        const href = (a as HTMLAnchorElement).href;
        return href;
      });
    });
    page.close();
    return [...new Set(links)];
  }
}
