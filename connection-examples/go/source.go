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

	createSourceSQL := `CREATE SOURCE IF NOT EXISTS counter
	FROM LOAD GENERATOR COUNTER
	(TICK INTERVAL '500ms')
	WITH (SIZE = '3xsmall');`

	_, err = conn.Exec(ctx, createSourceSQL)
	if err != nil {
		fmt.Println(err)
	}

	defer conn.Close(context.Background())
}
