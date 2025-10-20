output "sqs_queue_url" {
  description = "The URL of the SQS queue"
  value       = module.sqs.telemetry_queue_url
}

output "function_name" {
  description = "The name of the Lambda function"
  value       = module.lambda_processor.function_name
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = module.s3_storage.bucket_name
}

output "lambda_role_arn" {
  description = "The ARN of the IAM role for Lambda"
  value       = module.iam.lambda_role_arn
}
