# Environment
environment = "dev"
aws_region  = "us-east-1"

# Lambda Configuration
lambda_config = {
  memory_size = 128
  timeout     = 30
  runtime     = "nodejs18.x"
}

# S3 Configuration  
s3_config = {
  glacier_transition_days = 30
  expiration_days         = 365
}

# Database Configuration 
clickhouse_url      = "https://vhk3qnfk91.us-east-1.aws.clickhouse.cloud:8443"
clickhouse_username = "default"
clickhouse_password = "2OLrj~O4wp3hU"
clickhouse_database = "cloudsight"

elasticsearch_url      = "https://search-cloudsight-dev-eccfq3z7p7uh4zp4wlvszjhoji.us-east-1.es.amazonaws.com"
elasticsearch_username = ""
elasticsearch_password = ""

# Logging
log_level = "info"
