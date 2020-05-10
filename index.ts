import express from 'express';

import tutByData from './routes/tutby';
import relaxByData from './routes/relaxby';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.end('<h1>Placard scraper</h1>');
});

app.use('/tutby', tutByData);
app.use('/relaxby', relaxByData);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
