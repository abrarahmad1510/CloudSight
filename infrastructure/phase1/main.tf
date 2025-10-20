terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# SQS Queue for telemetry
module "sqs" {
  source          = "./modules/sqs"
  resource_prefix = var.resource_prefix
  environment     = var.environment
  tags            = var.tags
}

# S3 Storage for raw telemetry
module "s3_storage" {
  source          = "./modules/s3"
  resource_prefix = var.resource_prefix
  environment     = var.environment
  s3_config       = var.s3_config
  tags            = var.tags
}

# IAM roles and policies
module "iam" {
  source          = "./modules/iam"
  resource_prefix = var.resource_prefix
  environment     = var.environment
  s3_bucket_arn   = module.s3_storage.bucket_arn
  sqs_arn         = module.sqs.telemetry_queue_arn
  tags            = var.tags
}

# Lambda processor
module "lambda_processor" {
  source = "./modules/lambda"

  resource_prefix = var.resource_prefix
  source_dir      = var.source_dir
  lambda_role_arn = module.iam.lambda_role_arn
  lambda_config   = var.lambda_config
  environment     = var.environment
  log_level       = var.log_level

  # Database Configuration
  clickhouse_url               = var.clickhouse_url
  clickhouse_username          = var.clickhouse_username
  clickhouse_password          = var.clickhouse_password
  clickhouse_database          = var.clickhouse_database
  clickhouse_max_retries       = var.clickhouse_max_retries
  clickhouse_request_timeout   = var.clickhouse_request_timeout

  elasticsearch_url            = var.elasticsearch_url
  elasticsearch_username       = var.elasticsearch_username
  elasticsearch_password       = var.elasticsearch_password
  elasticsearch_max_retries    = var.elasticsearch_max_retries
  elasticsearch_request_timeout = var.elasticsearch_request_timeout
  
  tags = var.tags
}

# Lambda event source mapping for SQS
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = module.sqs.telemetry_queue_arn
  function_name    = module.lambda_processor.function_name
  batch_size       = 10
}
