import express from "express"
import router from "./routes/api";
const app = express();

app.use(express.json());

app.use(router);

const PORT = 4000;
app.listen(PORT, 'localhost', () => {
    console.log(`Server listning on http://localhost:${PORT}`);
});





