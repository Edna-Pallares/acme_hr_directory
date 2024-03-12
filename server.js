const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_deparments_employees_db"
);

const init = async () => {
  await client.connect();
  console.log('connected to database')
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
      INSERT INTO deparments(name) VALUES('Finance');
      INSERT INTO deparments(name) VALUES('Operations');
      INSERT INTO deparments(name) VALUES('Marketing');

      INSERT INTO employees(name, department_id) VALUES(Lionel Messi);
      INSERT INTO employees(name, department_id) VALUES(Robert Lewandowski);
      INSERT INTO employees(name, department_id) VALUES(Kylian Mbappe);
      INSERT INTO employees(name, department_id) VALUES(Mohamed Salah);
      INSERT INTO employees(name, department_id) VALUES(Cristiano Ronaldo);
    `;
  await client.query(SQL);
  console.log("data seeded");
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
