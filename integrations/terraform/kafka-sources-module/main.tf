terraform {
  required_providers {
    materialize = {
      source  = "MaterializeInc/materialize"
      version = ">= 0.6.0"
    }
  }
}

locals {
  kafka_sources = [
    { name = "source1", topic = "topic1" },
    { name = "source2", topic = "topic1" },
    { name = "source3", topic = "topic1" }
    # Add more sources
  ]
}

module "kafka_source" {
  for_each = { for src in local.kafka_sources : src.name => src }

  source = "./modules/kafka_source"
  name   = each.value.name
  topic  = each.value.topic
}
