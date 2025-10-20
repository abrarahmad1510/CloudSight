variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "resource_prefix" {
  description = "Prefix for resource names"
  type        = string
  default     = "test-cloudsight"
}

variable "source_dir" {
  description = "Path to Lambda source code"
  type        = string
  default     = "../../ingestion/telemetry-processor"
}

variable "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  type        = string
  default     = ""
}

variable "lambda_config" {
  description = "Lambda function configuration"
  type = object({
    runtime     = string
    memory_size = number
    timeout     = number
  })
  default = {
    runtime     = "nodejs18.x"
    memory_size = 128
    timeout     = 30
  }
}

variable "s3_config" {
  description = "S3 bucket configuration"
  type = object({
    glacier_transition_days = number
    expiration_days         = number
  })
  default = {
    glacier_transition_days = 30
    expiration_days         = 365
  }
}

variable "log_level" {
  description = "Log level for the Lambda function"
  type        = string
  default     = "info"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Project     = "cloudsight"
    Team        = "platform"
    Environment = "dev"
  }
}

# ClickHouse variables
variable "clickhouse_url" {
  description = "ClickHouse connection URL"
  type        = string
}

variable "clickhouse_username" {
  description = "ClickHouse username"
  type        = string
}

variable "clickhouse_password" {
  description = "ClickHouse password"
  type        = string
  sensitive   = true
}

variable "clickhouse_database" {
  description = "ClickHouse database name"
  type        = string
  default     = "cloudsight"
}

variable "clickhouse_max_retries" {
  description = "ClickHouse max retries"
  type        = number
  default     = 3
}

variable "clickhouse_request_timeout" {
  description = "ClickHouse request timeout in ms"
  type        = number
  default     = 30000
}

# Elasticsearch variables
variable "elasticsearch_url" {
  description = "Elasticsearch connection URL"
  type        = string
}

variable "elasticsearch_username" {
  description = "Elasticsearch username"
  type        = string
}

variable "elasticsearch_password" {
  description = "Elasticsearch password"
  type        = string
  sensitive   = true
}

variable "elasticsearch_max_retries" {
  description = "Elasticsearch max retries"
  type        = number
  default     = 3
}

variable "elasticsearch_request_timeout" {
  description = "Elasticsearch request timeout in ms"
  type        = number
  default     = 30000
}
