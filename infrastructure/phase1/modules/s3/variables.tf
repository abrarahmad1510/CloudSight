variable "resource_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "s3_config" {
  description = "S3 bucket configuration"
  type = object({
    glacier_transition_days = number
    expiration_days         = number
  })
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
