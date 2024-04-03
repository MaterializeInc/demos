terraform {
  required_providers {
    materialize = {
      source  = "MaterializeInc/materialize"
      version = ">= 0.6.0"
    }
  }
}

variable "name" {
  type        = string
  description = "The name of the Kafka source."
}

variable "topic" {
  type        = string
  description = "The Kafka topic to subscribe to."
}

variable "cluster_name" {
  type        = string
  description = "The name of the Kafka cluster to connect to."
  default     = "quickstart"
}

resource "materialize_source_kafka" "example_source_kafka" {
  name          = var.name
  database_name = "materialize"
  schema_name   = "public"
  topic         = var.topic
  cluster_name  = var.cluster_name

  kafka_connection {
    name          = "shared_kafka_connection"
    database_name = "materialize"
    schema_name   = "public"
  }

  format {
    avro {
      schema_registry_connection {
        name          = "shared_csr_connection"
        database_name = "materialize"
        schema_name   = "public"
      }
    }
  }

  envelope {
    none = true
  }
}
