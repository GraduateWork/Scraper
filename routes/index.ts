import express from 'express';

import { Status } from './interfaces';
import FilmsScraper from '../src/tutby/films';
import { Film } from '../src/tutby/films/interfaces';

const router = express.Router();

let filmsStatus: Status = Status.Start;
let films: Film[] = [];
router.get('/films', async (request, response) => {
  if (filmsStatus === Status.Start) {
    const scraper = new FilmsScraper();
    response.sendStatus(202);
    filmsStatus = Status.Progress;
    films = await scraper.getData();
    console.log(films.length);
    filmsStatus = Status.Finish;
  } else if (filmsStatus === Status.Progress) {
    response.sendStatus(202);
  } else if (filmsStatus === Status.Finish) {
    filmsStatus = Status.Start;
    response.json(films);
  }
});

export default router;
