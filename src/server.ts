import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";
import config from "./config/index.js";
const app: Application = express();
const port = config.Port;

app.use(express.json());
const pool = new Pool({
  connectionString: config.connectionString,
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/products", async (req: Request, res: Response) => {
  const { product_name, user_name, user_email, password, price } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products(
       product_name,
        user_name,
        user_email,
        password,
        price) VALUES($1,$2,$3,$4,$5) 
        RETURNING *`,
      [product_name, user_name, user_email, password, price],
    );
    console.log(result.rows[0]);
    res.status(201).json({
      success: true,
      messege: "products retrive successfull",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      messege: error.message,
      error: error,
    });
  }
});

app.get("/products", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM products`);
    res.status(201).json({
      success: true,
      messege: "products retrive successfully.",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      messege: error.message,
      error: error,
    });
  }
});

app.get("/products/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE product_id=$1`,
      [id],
    );
    console.log(result);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        messege: "Products not found",
      });
    }
    res.status(201).json({
      success: true,
      messege: "single product retrive",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      messege: error.message,
      error: error,
    });
  }
});

app.put("/products/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { product_name, user_name, user_email, password, is_stock, price } =
    req.body;
  console.log(
    product_name,
    user_name,
    user_email,
    password,
    is_stock,
    price,
    id,
  );
  try {
    const result = await pool.query(
      `UPDATE products SET 
        product_name=COALESCE($1,product_name),
        user_name=COALESCE($2,user_name),
        user_email=COALESCE($3,user_email),
        password=COALESCE($4,password),
        is_stock=COALESCE($5,is_stock),
        price=COALESCE($6,price)

        WHERE product_id=$7 RETURNING *
        `,
      [product_name, user_name, user_email, password, is_stock, price, id],
    );
    res.status(201).json({
      success: true,
      messege: "product update successfully.",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      messege: error.message,
      error: error,
    });
  }
});

app.delete("/products/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const result = await pool.query(
      `DELETE FROM products WHERE product_id =$1`,
      [id],
    );
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        messege: "product not found",
      });
    }
    res.status(200).json({
      success: true,
      messege: "product delete successfull",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      messege: error.message,
      error: error,
    });
  }
});
const initDB = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS products(
        product_id SERIAL PRIMARY KEY,
        product_name VARCHAR(40),
        user_name VARCHAR(40),
        user_email VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(20) NOT NULL,
        is_stock BOOLEAN DEFAULT true,
        price INT,
        
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW()

        )`);
    console.log("Database Created Successfully");
  } catch (error) {}
};
initDB();
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
