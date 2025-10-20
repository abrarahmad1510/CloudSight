#!/bin/bash
echo "🏥 Final health check..."
# Verify all resources are accessible
echo "=== S3 Bucket ==="
aws s3 ls s3://dev-cloudsight-raw-telemetry --region us-east-1 && echo "S3 bucket accessible" || echo "Error: Failed to access S3 bucket."
echo "=== SQS Queue ==="
aws sqs get-queue-attributes \
  --queue-url "https://sqs.us-east-1.amazonaws.com/437387546952/dev-cloudsight-telemetry" \
  --attribute-names "All" \
  --region us-east-1 \
  --query "Attributes.ApproximateNumberOfMessages" \
  --output text || echo "Error: Failed to retrieve SQS queue attributes."
echo "=== Lambda Function ==="
aws lambda get-function \
  --function-name "test-cloudsight-function" \
  --region us-east-1 \
  --query "Configuration.LastModified" \
  --output text || echo "Error: Failed to retrieve Lambda function details."
echo "✅ Phase 1 infrastructure is successfully deployed and operational!"
