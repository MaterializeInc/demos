package main

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v4"
)

func main() {

	ctx := context.Background()
	connStr := "postgres://MATERIALIZE_USERNAME:APP_SPECIFIC_PASSWORD@MATERIALIZE_HOST:6875/materialize?sslmode=require"

	conn, err := pgx.Connect(ctx, connStr)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("Connected to Materialize!")
	}

	createViewSQL := `CREATE MATERIALIZED VIEW IF NOT EXISTS counter_sum AS
						SELECT sum(counter)
						FROM counter;`
	_, err = conn.Exec(ctx, createViewSQL)
	if err != nil {
		fmt.Println(err)
	}

	defer conn.Close(context.Background())
}
