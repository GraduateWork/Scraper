import express from 'express';
import FilmsScraper from '../src/tutby/films';

const router = express.Router();

router.get('/films', async (request, response) => {
  const scraper = new FilmsScraper();
  const data = await scraper.getData();
  response.json(data);
});

export default router;
