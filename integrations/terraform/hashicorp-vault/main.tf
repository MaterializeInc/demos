terraform {
  required_providers {
    vault = {
      source  = "hashicorp/vault"
      version = "~> 3.15"
    }
    materialize = {
      source  = "MaterializeInc/materialize"
      version = "0.0.5"
    }
  }
}

# Use development mode to experiment
# https://developer.hashicorp.com/vault/docs/concepts/dev-server
provider "vault" {
  address = "http://localhost:8200"
  token   = var.vault_token
}

provider "materialize" {
  host     = var.materialize_hostname # optionally use MZ_HOST env var
  username = var.materialize_username # optionally use MZ_USER env var
  password = var.materialize_password # optionally use MZ_PW env var
  port     = var.materialize_port     # optionally use MZ_PORT env var
  database = var.materialize_database # optionally use MZ_DATABASE env var
}

variable "materialize_hostname" {}
variable "materialize_username" {}
variable "materialize_password" {}
variable "materialize_port" {
  default = 6875
}
variable "materialize_database" {
  default = "materialize"
}
variable "vault_token" {}

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
