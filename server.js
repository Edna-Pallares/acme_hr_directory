const express = require("express");
const app = express();
const path = require("path");
const pg = require("pg");

const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://localhost/acme_departments_employees_db"
);

app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/employees", async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from employees;
    `;
    const result = await client.query(SQL);
    res.send(result.rows);
  } catch (ex) {
    next(ex);
  }
});
app.get("/api/departments", async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from departments;
    `;
    const result = await client.query(SQL);
    res.send(result.rows);
  } catch (ex) {
    next(ex);
  }
});
app.post("/api/employees", async (req, res, next) => {
  try {
    const SQL = `INSERT INTO employees(name, department_id)
      VALUES ($1, (SELECT id FROM departments WHERE name=$2))
      RETURNING *`;
    const result = await client.query(SQL, [
      req.body.name,
      req.body.departmentName,
    ]);
    res.send(result.rows[0]);
  } catch (ex) {
    next(ex);
  }
});
app.delete("/api/employees/:id", async (req, res, next) => {
  try {
    const SQL = `
      DELETE FROM employees
      WHERE id = $1;
    `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});
app.put("/api/employees/:id", async (req, res, next) => {
  try {
    const SQL = `UPDATE employees
      SET name = $1, department_id = (SELECT id FROM departments WHERE name=$2), updated_at=now()
      WHERE id = $3 RETURNING *`;
    const result = await client.query(SQL, [
      req.body.name,
      req.body.departmentName,
      req.params.id,
    ]);
    res.send(result.rows[0]);
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  let SQL = `
      DROP TABLE IF EXISTS employees;
      DROP TABLE IF EXISTS departments;

      CREATE TABLE departments(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      );

      CREATE TABLE employees(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        department_id INTEGER REFERENCES departments(id) NOT NULL
      );
    `;
  await client.query(SQL);
  console.log("tables created");
  SQL = `
      INSERT INTO deparments(name) VALUES('Human Resources');
      INSERT INTO deparments(name) VALUES('Operations');
      INSERT INTO deparments(name) VALUES('Marketing');

      INSERT INTO employees(name, department_id) VALUES('Lionel Messi', (SELECT id FROM departments WHERE name='Marketing'));
      INSERT INTO employees(name, department_id) VALUES('Robert Lewandowski', (SELECT id FROM departments WHERE name='Operations'));
      INSERT INTO employees(name, department_id) VALUES('Kylian Mbappe', (SELECT id FROM departments WHERE name='Marketing'));
      INSERT INTO employees(name, department_id) VALUES('Mohamed Salah', (SELECT id FROM departments WHERE name='Human Resources'));
      INSERT INTO employees(name, department_id) VALUES('Cristiano Ronaldo', (SELECT id FROM departments WHERE name='Operations'));
    `;
  await client.query(SQL);
  console.log("data seeded");
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
