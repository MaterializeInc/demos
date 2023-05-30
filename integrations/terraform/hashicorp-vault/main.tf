terraform {
  required_providers {
    vault = {
      source = "hashicorp/vault"
      version = "~> 3.15"
    }
    materialize = {
      source = "MaterializeInc/materialize"
      version = "0.0.5"
    }
  }
}

# Use development mode to experiment
# https://developer.hashicorp.com/vault/docs/concepts/dev-server
provider "vault" {
  address = "http://localhost:8200"
  token = local.vault_token
}

provider "materialize" {
  host     = local.materialize_host
  username = local.materialize_username
  password = local.materialize_password
  port     = 6875
  database = "materialize"
}

data "vault_generic_secret" "materialize_password" {
  path = "secret/materialize"
}

resource "materialize_secret" "example_secret" {
  name  = "pgpass"
  value = data.vault_generic_secret.materialize_password.data["pgpass"]
}

# Create a PostgreSQL Connection
resource "materialize_connection_postgres" "example_postgres_connection" {
  name = "example_postgres_connection"
  host = "instance.foo000.us-west-1.rds.amazonaws.com"
  port = 5432
  user {
    text = "pguser"
  }
  password {
    name          = materialize_secret.example_secret.name
    database_name = "materialize"
    schema_name   = "public"
  }
  database = "pgdatabase"
}
