# Define the Materialize provider
terraform {
  required_providers {
    materialize = {
      source  = "MaterializeInc/materialize"
      version = "0.0.4"
    }
  }
}

# Include the AWS provider
provider "aws" {
  region = "us-east-1"
}

# Include the Materialize provider
provider "materialize" {
  host     = local.materialize_host
  username = local.materialize_username
  password = local.materialize_password
  port     = 6875
  database = "materialize"
}

# Use the materialize msk module
module "msk" {
  source              = "MaterializeInc/msk-privatelink/aws"
  version             = "0.1.2"
  mz_msk_cluster_name = local.mz_msk_cluster_name
  mz_msk_cluster_port = local.mz_msk_cluster_port
  mz_msk_vpc_id       = local.mz_msk_vpc_id
  aws_region          = local.aws_region
}

# Create a PrivateLink connection in Materialize
resource "materialize_connection_aws_privatelink" "example_privatelink_connection" {
  name               = "example_privatelink_connection"
  schema_name        = "public"
  service_name       = module.msk.mz_msk_endpoint_service.service_name
  availability_zones = module.msk.mz_msk_azs
}

# Add the Materialize allowed principal to the AWS VPC Endpoint Service
resource "aws_vpc_endpoint_service_allowed_principal" "example_privatelink_connection" {
  vpc_endpoint_service_id = module.msk.mz_msk_endpoint_service.id
  principal_arn           = materialize_connection_aws_privatelink.example_privatelink_connection.principal
}

# Finally go to your AWS account and approve the VPC Endpoint Service connection
