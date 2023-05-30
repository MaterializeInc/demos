# Materialize Terraform Provider + HashiCorp Vault

[HashiCorp Vault](https://www.vaultproject.io/) is a powerful tool for securely managing sensitive credentials. This demo guides you through combining the Materialize and Vault Terraform providers to access secrets stored in Vault in Materialize.

## Overview

![](https://github.com/MaterializeInc/demos/assets/21223421/edc48e99-77b3-4c47-8e86-472c51d45f70)

## Prerequisites

- Install [Vault](https://developer.hashicorp.com/vault/downloads)
- Install [Terraform](https://developer.hashicorp.com/terraform/downloads) 1.0.3 or later
- [Materialize](https://cloud.materialize.com/) account.
- Follow the steps in the [README.md](../README.md) file to set up your AWS configuration and Materialize details.

## Setting up Vault

Before we can use Vault, we need to start a Vault server. For testing purposes, we'll run Vault in [development mode](https://developer.hashicorp.com/vault/docs/concepts/dev-server):

```bash
vault server -dev
```

In this mode, Vault runs entirely in-memory and starts unsealed with a single unseal key. The command above will return the unseal key and a root token for authentication. Make sure to note down the root token, as you'll use it to authenticate with Vault next.

## Interacting with Vault

In development mode, the default Vault address to bind to is `127.0.0.1:8200`. Open a new terminal and export this address using the `VAULT_ADDR` environment variable:

```bash
export VAULT_ADDR='http://127.0.0.1:8200'
```

Use the root token from previous steps to authenticate:

```bash
vault login <root-token>
```

Once authenticated, you can begin to interact with Vault.

## Adding and retrieving secrets in Vault

To store a secret in Vault, you can use the `vault kv put` command.

```bash
vault kv put secret/materialize pgpass=some-secret-value
```

The vault `kv put` command creates a key-value secret in the path specified. In this case, the secret is stored in `secret/materialize`.

To retrieve a secret, use the `vault kv get` command:

```bash
vault kv get secret/materialize
```

## Integrating Vault with Terraform:

Terraform has a Vault provider that you can use in combination with the Materialize provider to manage secrets stored externally.

Start by creating a `main.tf` configuration file, and add the Vault provider and the Materialize provider to it:

```hcl
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
```

In the same file, initialize the Vault provider:

```hcl
provider "vault" {
  address = "http://localhost:8200"
  token = "<Root-Token>"
}
```

Replace `<root-token>` with the root token of your Vault server.

Then, initialize the Materialize provider:

```hcl
provider "materialize" {
  host     = local.materialize_host
  username = local.materialize_username
  password = local.materialize_password
  port     = 6875
  database = "materialize"
}
```

Set the `local` variables for `materialize_host`, `materialize_username`, and `materialize_password` to use your Materialize credentials:

```hcl
locals {
  materialize_host     = "cloud.materialize.com"
  materialize_username = "<Materialize-username>"
  materialize_password = "<Materialize-password>"
  # The Vault root token
  vault_token          = "<root-token>"
}
```

Replace `<Materialize-username>` and `<Materialize-password>` with the username and password of your Materialize account.

## Retrieving a secret from Vault

Now you can use the `vault_generic_secret` data source to retrieve the secret from Vault:

```hcl
data "vault_generic_secret" "materialize_password" {
  path = "secret/materialize"
}
```

Finally, use the secret retrieved from Vault in your `materialize_secret` resource:

```hcl
resource "materialize_secret" "example_secret" {
  name  = "pgpass"
  value = data.vault_generic_secret.materialize_password.data["pgpass"]
}
```

## Running the Terraform script

Now that the Terraform script is ready, run the following commands to initialize and apply the script:

```bash
# Initialize the Terraform configuration:
terraform init

# Apply the Terraform configuration:
terraform apply
```

Output:

```bash
Plan: 1 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

materialize_secret.example_secret: Creating...
materialize_secret.example_secret: Creation complete after 3s [id=u111]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

Once the script has been applied, you can verify that the secret has been created in Materialize. Connect to your Materialize region using your preferred [SQL client](https://materialize.com/docs/integrations/sql-clients/), and run:

```sql
SHOW SECRETS;
```

## Using the secret in connections

Once the secret has been created, you can use it in your `CREATE CONNECTION` statements. In this example, we'll create a connection to a Postgres instance using the secret we created using the `materialize_connection_postgres` resource:

```hcl
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
```

The `password` block references the secret we created earlier.

## Cleaning up

To clean up the resources created by Terraform, you can run the following command:

```bash
terraform destroy
```

## Conclusion

In this demo, you learned how to use the Materialize Terraform provider to use secrets stored in an external secret store like HashiCorp Vault in Materialize.

In a production environment, you wouldn't run Vault locally in dev mode. Instead, a highly available, secure, and resilient Vault cluster would be deployed on your cloud instances, ensuring that secrets remain accessible and secure. Rather than using the root token for authentication, you'd employ more secure authentication methods, such as IAM roles for AWS or Kubernetes service accounts and all communication between Vault and its clients should be over a secure HTTPS connection.

For the complete Terraform script, see the [`main.tf`](./main.tf) file.

## Useful links

- [Materialize Terraform Provider](https://registry.terraform.io/providers/MaterializeInc/materialize/latest/docs)
- [HashiCorp Vault Terraform Provider](https://registry.terraform.io/providers/hashicorp/vault/latest/docs)
- [HashiCorp Vault](https://www.vaultproject.io/)
- [`CREATE SECRET`](https://materialize.com/docs/sql/create-secret/)
- [`CREATE CONNECTION`](https://materialize.com/docs/sql/create-connection/)
