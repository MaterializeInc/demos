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
