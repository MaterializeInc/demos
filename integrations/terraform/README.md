# Materialize Terraform Provider Demos

## Overview

This is a collection of demos that show how to use the [Materialize Terraform provider](https://registry.terraform.io/providers/MaterializeInc/materialize/latest/docs) to provision Materialize resources.

## Demos

| Demo                               | Description                                                             |
| ---------------------------------- | ----------------------------------------------------------------------- |
| [MSK PrivateLink](msk-privatelink) | Create an AWS PrivateLink connection between Materialize and Amazon MSK |
| [Secret Stores](secret-stores)     | Integrate Materialize with various secret management tools              |

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) 1.0.3 or later
- [Materialize](https://console.materialize.com/) account
- [AWS](https://aws.amazon.com/) account
- [`aws`](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) CLI
- [`psql`](https://materialize.com/docs/integrations/sql-clients/#installation-instructions-for-psql) installed

## Running the demos

For each demo, follow the instructions in the demo's README. All demos assume that you have `psql`, `terraform` and `aws` CLIs installed and configured.

### AWS Configuration

- Make sure that you've configured your AWS authentication as described in the [AWS provider documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration).

  For example, if you are using AWS SSO, you can use the following `aws` command:

  ```bash
  aws sso login --profile your-aws-profile
  ```

- If you have a default AWS profile, you can skip this step. Otherwise, set the `AWS_PROFILE` environment variable to the desired profile:

  ```bash
  export AWS_PROFILE=your-aws-profile
  ```

- If you have a default AWS configuration, you can skip this step. Otherwise, set the `AWS_CONFIG_FILE` environment variable to the desired configuration file:

  ```bash
  export AWS_CONFIG_FILE=<your_aws_config_file> # eg. ["~/.aws/config"]
  ```

- All demos use the `us-east-1` region by default. To use a different region, set the `AWS_REGION` environment variable to the desired region:

  ```bash
  export AWS_REGION=us-west-2
  ```

### Materialize Configuration

- Get your Materialize host, username, and password from the [Materialize console](https://console.materialize.com/).
- Configure the Materialize Terraform provider by adding the following block to your Terraform project:

    ```hcl
    # Configuration-based authentication
    provider "materialize" {
      host     = var.materialize_hostname # optionally use MZ_HOST env var
      username = var.materialize_username # optionally use MZ_USER env var
      password = var.materialize_password # optionally use MZ_PW env var
      port     = var.materialize_port     # optionally use MZ_PORT env var
      database = var.materialize_database # optionally use MZ_DATABASE env var
    }
    ```
