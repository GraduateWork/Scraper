import express from 'express';
import data from './routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/tutby', data);

const port = process.env.PORT || 5050;

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});