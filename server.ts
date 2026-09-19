import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import router from './routes/api';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', router);

const PORT = Number(process.env.PORT ?? 4500);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
