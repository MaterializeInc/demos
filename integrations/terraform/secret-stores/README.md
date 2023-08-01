# Materialize Terraform Provider + Secret Stores

Secret management tools provide a secure way to store and manage sensitive credentials. This guide will show you how to integrate Materialize with a variety of secret management tools through the use of Terraform providers.

This guide will provide an overview of multiple secret managers, including:

- [HashiCorp Vault](https://registry.terraform.io/providers/hashicorp/vault/latest/docs)
- [AWS Secrets Manager](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/secretsmanager_secret_version)
- [Azure Key Vault](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/key_vault_secret)
- [Google Cloud Secret Manager](https://registry.terraform.io/providers/hashicorp/google/latest/docs/data-sources/secret_manager_secret_version)
- [1Password](https://registry.terraform.io/providers/1password/onepassword/latest/docs)
- [Akeyless Vault](https://registry.terraform.io/providers/akeyless-community/akeyless/latest)

## Overview

![Materialize Terraform Provider + Secret Stores](https://github.com/MaterializeInc/demos/assets/21223421/e9ab2990-0c41-4e51-a313-1a955445e25b)

## Prerequisites

- Install [Terraform](https://developer.hashicorp.com/terraform/downloads) 1.0.3 or later
- [Materialize](https://cloud.materialize.com/) account.
- Follow the steps in the [README.md](../README.md) file to set up your AWS configuration and Materialize details.

## Secret Management Tools

### HashiCorp Vault

[HashiCorp Vault](https://www.vaultproject.io/) is a powerful tool for securely managing sensitive credentials.

To use Vault with Materialize, you'll need to install the [Terraform Vault provider](https://registry.terraform.io/providers/hashicorp/vault/latest/docs).

```
terraform {
  required_providers {
    vault = {
      source  = "hashicorp/vault"
      version = "~> 3.15"
    }
  }
}

provider "vault" {
  address = "https://vault.example.com"
  token   = "your-vault-token"
}
```

Next, fetch a secret from Vault and use it to create a new Materialize secret:

```hcl
data "vault_generic_secret" "materialize_password" {
  path = "secret/materialize"
}

resource "materialize_secret" "example_secret" {
  name  = "pgpass"
  value = data.vault_generic_secret.materialize_password.data["pgpass"]
}
```

In this example, the `vault_generic_secret` data source retrieves a secret from Vault, which is then used as the value for a new `materialize_secret` resource.

### AWS Secrets Manager

AWS Secrets Manager is a secret management service from Amazon Web Services that safeguards access to your applications, services, and IT resources. You can retrieve information about a Secrets Manager secret version, including its secret value, using the `aws_secretsmanager_secret_version` data source.

```hcl
provider "aws" {
  region = "us-west-2"
}

data "aws_secretsmanager_secret_version" "materialize_password" {
  secret_id = "materialize_secret"
}

resource "materialize_secret" "example_secret" {
  name  = "secret"
  value = data.aws_secretsmanager_secret_version.materialize_password.secret_string
}
```

In the provided example, we first configure the AWS provider with the appropriate region. Then, we access the secret from AWS Secrets Manager and use it to create a new secret in Materialize.

### Azure Key Vault

Azure Key Vault, a service provided by Microsoft Azure, securely stores and accesses secrets such as API keys, passwords, and cryptographic keys. Utilize the `azurerm_key_vault_secret` data source to fetch information about a Key Vault secret, including its value.

```hcl
provider "azurerm" {
  features {}
}

data "azurerm_key_vault_secret" "materialize_password" {
  name         = "materialize_secret"
  key_vault_id = data.azurerm_key_vault.existing.id
}

resource "materialize_secret" "example_secret" {
  name  = "secret"
  value = data.azurerm_key_vault_secret.materialize_password.value
}
```

In the Azure Key Vault example, we first set up the Azure provider. We then retrieve the secret from Azure Key Vault and use this secret to create a new one in Materialize.

### Google Cloud Secret Manager

Google Cloud Secret Manager offers a secure and convenient method for storing sensitive data. To fetch a secret version's information, including its value, use the `google_secret_manager_secret_version` data source.

```hcl
provider "google" {
  project = "my-project-id"
  region  = "us-central1"
  zone    = "us-central1-c"
}

data "google_secret_manager_secret_version" "materialize_password" {
  secret_id = "materialize_secret"
  version   = "latest"
}

resource "materialize_secret" "example_secret" {
  name  = "secret"
  value = data.google_secret_manager_secret_version.materialize_password.secret_data
}
```

In the Google Cloud Secret Manager example, we set up the Google provider with the appropriate project, region, and zone. Afterward, we fetch the secret from Google Cloud Secret Manager and use it to set up a new secret in Materialize.

### 1Password

1Password is a password manager that provides a secure place to store various passwords, software licenses, and other sensitive information. The 1Password Terraform provider allows you to retrieve this information programmatically using the `onepassword_item` data source.

```hcl
provider "onepassword" {
  subdomain = "mycompany"
  token     = "mytoken"
}

data "onepassword_item" "materialize_password" {
  vault = "Private"
  title = "Materialize Secret"
}

resource "materialize_secret" "example_secret" {
  name  = "secret"
  value = data.onepassword_item.materialize_password.items[0].value
}
```

In the example, we set up the 1Password provider, retrieve the secret from the 1Password vault, and use it to create a new secret in Materialize.

### Akeyless Vault

Akeyless Vault is a Universal Secrets Manager that offers a unified solution for secrets management, privileged access, and encryption key management. To retrieve a secret's information, including its value, use the `akeyless_secret` data source.

```hcl
provider "akeyless" {
  access_id = "akeyless_access_id"
  access_key = "akeyless_access_key"
}

data "akeyless_secret" "materialize_password" {
  name = "materialize_secret"
}

resource "materialize_secret" "example_secret" {
  name  = "secret"
  value = data.akeyless_secret.materialize_password.value
}
```

In the Akeyless Vault example, we set up the Akeyless provider with the appropriate access ID and key. Then, we get the secret from Akeyless Vault and use it to set up a new secret in Materialize.

## Conclusion

It is important to keep in mind that your secrets will reside in two locations: within Materialize and your secret management system. The Materialize secret resource is a reference to the secret in your secret management system. Thus, any modifications to the secret value in your secret management system require a re-execution of the Terraform script to ensure the Materialize secret resource aligns with the updated secret.

## Useful links

- [Materialize Terraform Provider](https://registry.terraform.io/providers/MaterializeInc/materialize/latest/docs)
- [`CREATE SECRET`](https://materialize.com/docs/sql/create-secret/)
- [`CREATE CONNECTION`](https://materialize.com/docs/sql/create-connection/)
