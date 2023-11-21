# Terraform Policies with Materialize

[Sentinel](https://www.hashicorp.com/sentinel) is a policy-as-code framework that allows you to define, enforce, and monitor policies across your entire stack. Sentinel, available with Terraform Cloud and Enterprise, enhances this setup by providing policy-as-code to enforce governance across your IaC operations.

For open-source Terraform users, policy enforcement can be handled through custom scripts or CI/CD pipeline steps to validate plans before application.

## Prerequisites

-   Terraform installed (version 1.0.3 or later recommended)
-   Materialize account
-   Access to Terraform Cloud for Sentinel policy enforcement

## Writing and Testing Sentinel Policies

[Sentinel policies](https://developer.hashicorp.com/terraform/tutorials/cloud-get-started/policy-quickstart) allow you to enforce rules on your Terraform plans. Here's an example policy that ensures Materialize cluster sizes are kept within designated bounds:

### Sentinel Policy Example: `restrict-materialize-cluster-size.sentinel`

```hcl
import "tfplan"

allowed_sizes = [
    "3xsmall",
    "2xsmall",
    "xsmall",
    "small",
]

main = rule {
    all tfplan.resources.materialize_cluster as _, instances {
        all instances as _, r {
            r.applied.size in allowed_sizes or r.destroy
        }
    }
}
```

## Terraform Configuration for Materialize

Set up your Materialize cluster with Terraform using the following configuration:

### Terraform Configuration: `materialize_cluster.tf`

```hcl
resource "materialize_cluster" "example_cluster" {
  name = "production-cluster"
  size = "small"
}
```

### Applying the Configuration

Initialize Terraform and apply your configuration:

```bash
terraform init
terraform plan
terraform apply
```

## Sentinel Integration in Terraform Cloud

In Terraform Cloud, upload your Sentinel policies directly to your workspace and create a policy set to enforce them. You can also use the Sentinel CLI to test your policies locally before uploading them to Terraform Cloud.

Then, trigger a run in Terraform Cloud. Your Sentinel policy will automatically be enforced.

## Open-Source Terraform Approach

Without Terraform Cloud, you can use a script to enforce policies. For instance, you can parse the output of `terraform plan` and validate it against your rules.

You can use the Open Policy Agent (OPA) to enforce policies. OPA is an open-source, general-purpose policy engine that unifies policy enforcement across the stack.

However when using OPA with open-source Terraform, the policy enforcement is not as tightly integrated into the Terraform workflow as it would be with Sentinel in Terraform Cloud or Enterprise.

In the open-source model, the enforcement relies on the discipline of the team and the robustness of the CI/CD pipeline setup.

## Useful links

- [Materialize Terraform Provider](https://registry.terraform.io/providers/MaterializeInc/materialize/latest/docs)
- [Sentinel](https://www.hashicorp.com/sentinel)
- [Open Policy Agent](https://www.openpolicyagent.org/)
