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
  name  = "secret"
  value = data.vault_generic_secret.materialize_password.data["password"]
}

resource "materialize_connection_kafka" "example_kafka_connection" {
  name = "example_kafka_connection"
  kafka_broker {
    broker = "b-1.hostname-1:9096"
  }
  sasl_username {
    text = "kafka_username"
  }
  sasl_password {
    name          = materialize_secret.example_secret.name
    database_name = "materialize"
    schema_name   = "public"
  }
  sasl_mechanisms = "SCRAM-SHA-256"
}
