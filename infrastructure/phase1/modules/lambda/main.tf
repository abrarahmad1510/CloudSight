data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/lambda_function.zip"
  
  depends_on = [null_resource.build_lambda]
}

# Build the Lambda function before zipping
resource "null_resource" "build_lambda" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = "cd ${var.source_dir} && npm run build"
  }
}

resource "aws_lambda_function" "telemetry_processor" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.resource_prefix}-processor"
  role             = var.lambda_role_arn
  handler          = "dist/index.handler"
  runtime          = var.lambda_config.runtime
  timeout          = var.lambda_config.timeout
  memory_size      = var.lambda_config.memory_size

  environment {
    variables = {
      # ClickHouse Configuration
      CLICKHOUSE_URL               = var.clickhouse_url
      CLICKHOUSE_USERNAME          = var.clickhouse_username
      CLICKHOUSE_PASSWORD          = var.clickhouse_password
      CLICKHOUSE_DATABASE          = var.clickhouse_database
      CLICKHOUSE_MAX_RETRIES       = var.clickhouse_max_retries
      CLICKHOUSE_REQUEST_TIMEOUT   = var.clickhouse_request_timeout
      
      # Elasticsearch Configuration
      ELASTICSEARCH_NODE           = var.elasticsearch_url
      ELASTICSEARCH_USERNAME       = var.elasticsearch_username
      ELASTICSEARCH_PASSWORD       = var.elasticsearch_password
      ELASTICSEARCH_MAX_RETRIES    = var.elasticsearch_max_retries
      ELASTICSEARCH_REQUEST_TIMEOUT = var.elasticsearch_request_timeout
      
      # Application Configuration
      NODE_ENV                     = var.environment
      LOG_LEVEL                    = var.log_level
    }
  }

  tags = var.tags

  depends_on = [data.archive_file.lambda_zip]
}

output "lambda_arn" {
  value = aws_lambda_function.telemetry_processor.arn
}

output "function_name" {
  value = aws_lambda_function.telemetry_processor.function_name
}
