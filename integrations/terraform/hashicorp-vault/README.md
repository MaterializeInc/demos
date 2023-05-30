# Materialize Terraform Provider + HashiCorp Vault

HashiCorp Vault is a powerful tool for securely accessing secrets. This demo will guide you through the process of setting up and using [Vault](https://www.vaultproject.io/), as well as demonstrating how to interact with the Materialize Terraform provider using the `materialize_secret` resource with secrets stored in Vault.

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

Open a new terminal and export the `VAULT_ADDR`:

```bash
export VAULT_ADDR='http://127.0.0.1:8200'
```

Use the root token from previous steps to authenticate:

```bash
vault login <Root-Token>
```

Once authenticated, you can begin to interact with Vault.

## Adding and Retrieving a Secret in Vault

To store a secret in Vault, we can use the `vault kv put` command.

```bash
vault kv put secret/materialize pgpass=some-secret-value
```

The vault `kv put` command creates a key-value secret at the path specified. In this case, the secret is stored at `secret/materialize`.

To retrieve a secret, you use the `vault kv get` command:

```bash
vault kv get secret/materialize
```

## Integrating Vault with Terraform:

Terraform has a Vault provider which you can use to retrieve secrets from Vault.

First, let's start by creating a file called `main.tf` and then in that file you will need to add the Vault provider and the Materialize provider:

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

You'll then have to initialize the Vault provider:

```hcl
provider "vault" {
  address = "http://localhost:8200"
  token = "<Root-Token>"
}
```

Replace `<Root-Token>` with the actual Root Token of your Vault server.

After that initialize the Materialize provider:

```hcl
provider "materialize" {
  host     = local.materialize_host
  username = local.materialize_username
  password = local.materialize_password
  port     = 6875
  database = "materialize"
}
```

You'll need to set the `local` variables for `materialize_host`, `materialize_username`, and `materialize_password`:

```hcl
locals {
  # The Materialize Cloud details
  materialize_host     = "cloud.materialize.com"
  materialize_username = "<Materialize-Username>"
  materialize_password = "<Materialize-Password>"
  # The Vault root token
  vault_token          = "<Root-Token>"
}
```

Replace `<Materialize-Username>` and `<Materialize-Password>` with the actual username and password of your Materialize Cloud account.

## Retrieving a Secret from Vault

Now you can use the `vault_generic_secret` data source to retrieve the secret from Vault:

```hcl
data "vault_generic_secret" "materialize_password" {
  path = "secret/materialize"
}
```

Finally, you can use the secret retrieved from Vault in your `materialize_secret` resource:

```hcl
resource "materialize_secret" "example_secret" {
  name  = "pgpass"
  value = data.vault_generic_secret.materialize_password.data["pgpass"]
}
```

## Running the Terraform Script

Now that you have the Terraform script ready, you can run the following commands to initialize and apply the script:

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

Once the script has been applied, you can verify that the secret has been created in Materialize Cloud:

```sql
SHOW SECRETS;
```

## Using the Secret in Connections

Once the secret has been created, you can use it in your `CREATE CONNECTION` statements. In this example, we'll create a connection to a Postgres instance using the secret we created using the `materialize_connection_postgres` resource:

```hcl
# Create a Postgres Connection
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

In this demo, you learned how to use the Materialize Terraform provider to create a secret in Materialize Cloud using a secret stored in HashiCorp Vault.

In a production environment, you wouldn't run Vault locally in dev mode. Instead, a highly available, secure, and resilient Vault cluster would be deployed on your cloud instances, ensuring that secrets remain accessible and secure. Rather than using the root token for authentication, you'd employ more secure authentication methods, such as IAM roles for AWS or Kubernetes service accounts and all communication between Vault and its clients should be over a secure HTTPS connection.

For the complete Terraform script, see the [`main.tf`](./main.tf) file.

## Useful Links

- [Materialize Terraform Provider](https://registry.terraform.io/providers/MaterializeInc/materialize/latest/docs)
- [HashiCorp Vault Terraform Provider](https://registry.terraform.io/providers/hashicorp/vault/latest/docs)
- [HashiCorp Vault](https://www.vaultproject.io/)
- [`CREATE SECRET`](https://materialize.com/docs/sql/create-secret/)
- [`CREATE CONNECTION`](https://materialize.com/docs/sql/create-connection/)
