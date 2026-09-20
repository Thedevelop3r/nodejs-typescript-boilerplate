import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import express from 'express';
import router from './routes/api';
import { getCookieSecret } from './utils/auth';

const app = express();

app.use(cookieParser(getCookieSecret()));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', router);

const PORT = Number(process.env.PORT ?? 4500);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
