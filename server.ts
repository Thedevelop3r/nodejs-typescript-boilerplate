import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import router from './routes/api';
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}))

app.use('/api', router);

const PORT = 4500;
app.listen(PORT, 'localhost', () => {
  console.log(`Server listning on http://localhost:${PORT}`);
});
