terraform {
  required_providers {
    materialize = {
      source  = "MaterializeInc/materialize"
      version = ">= 0.3.0"
    }
  }

  cloud {
    organization = "<your_organization>"

    workspaces {
      name = "<your_workspace>"
    }
  }
}

provider "materialize" {
  host     = var.materialize_hostname
  user = var.materialize_user
  password = var.materialize_password
  database = "materialize"
}

variable "materialize_hostname" {}
variable "materialize_user" {}
variable "materialize_password" {}

resource "materialize_cluster" "example_cluster" {
  name = "example"
  size = "3xsmall"
}
