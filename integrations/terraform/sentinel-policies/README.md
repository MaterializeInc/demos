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

To create an OPA policy that enforces the same rules for Materialize cluster sizes as the Sentinel policy, you will write a Rego policy. Rego is the high-level declarative language used by OPA for expressing policies.

### OPA Policy Example

Here is an example OPA policy, written in Rego, to enforce that the size of a Materialize cluster is one of the allowed sizes:

```rego
package terraform

import input as tfplan

# Define the allowed sizes for Materialize clusters
allowed_sizes := {
  "3xsmall",
  "2xsmall",
  "xsmall",
  "small"
}

# A violation occurs if a materialize_cluster is found with a size that is not allowed
violation[{"msg": msg, "resource": resource}] {
  resource := tfplan.resource_changes[_]
  resource.type == "materialize_cluster"
  resource.change.after.size
  not allowed_sizes[resource.change.after.size]

  msg := sprintf(
    "Materialize cluster '%s' has size '%s' which is not in the allowed list: %v",
    [resource.address, resource.change.after.size, allowed_sizes]
  )
}

# The main rule checks for any violations
deny[msg] {
  violation[{"msg": msg, "resource": _}]
}
```

In this OPA policy:

-   The `allowed_sizes` set contains the valid sizes for the Materialize clusters.
-   The `violation` rule finds any instances where a Materialize cluster's size is not in the `allowed_sizes` set.
-   The `deny` rule is the entry point for the policy, which OPA evaluates. If there are any violations, the policy will deny the Terraform plan.

### Testing the OPA Policy Locally

To test the policy locally, you would first need to generate a Terraform plan in a JSON format, which serves as the input to the OPA policy. Here's how you can do that:

```bash
terraform plan -out=tfplan.binary
terraform show -json tfplan.binary > tfplan.json
```

Then, you can evaluate the policy against your Terraform plan using the OPA CLI:

```bash
opa eval --format pretty --data restrict_materialize_cluster_size.rego --input tfplan.json "data.terraform.deny"
```

The output should look like this:

```bash
[
  "Materialize cluster 'materialize_cluster.example_cluster' has size 'xlarge' which is not in the allowed list: {\"2xsmall\", \"3xsmall\", \"small\", \"xsmall\"}"
]
```

### Integrating OPA in CI/CD Pipelines

To enforce OPA policies in an open-source Terraform environment, you would typically integrate OPA checks into your CI/CD pipeline. The process typically looks like this:

1.  Generate the Terraform plan in JSON format during the CI/CD pipeline execution.
2.  Run `opa eval` against the generated Terraform plan with your OPA policies.
3.  If OPA returns any `deny` messages, fail the CI/CD pipeline to prevent the plan from being applied.

By integrating OPA into your pipeline, you ensure that your Terraform plans are automatically checked against your policies before they can be applied, thus maintaining compliance and governance standards.

For further details and official guidance on integrating OPA with Terraform, you can refer to the [Open Policy Agent documentation](https://www.openpolicyagent.org/docs/latest/terraform/).

## Useful links

- [Materialize Terraform Provider](https://registry.terraform.io/providers/MaterializeInc/materialize/latest/docs)
- [Sentinel](https://www.hashicorp.com/sentinel)
- [Open Policy Agent](https://www.openpolicyagent.org/)
