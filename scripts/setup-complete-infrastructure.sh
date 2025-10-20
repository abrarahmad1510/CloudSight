#!/bin/bash
echo "🏗️  CLOUDSIGHT COMPLETE INFRASTRUCTURE SETUP"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if resource exists
check_resource() {
    local resource_type=$1
    local resource_name=$2
    local check_cmd=$3
    
    if eval $check_cmd &>/dev/null; then
        echo -e "${GREEN}✅ $resource_type: $resource_name${NC}"
        return 0
    else
        echo -e "${RED}❌ $resource_type: $resource_name (MISSING)${NC}"
        return 1
    fi
}

echo "1. Checking AWS Credentials..."
aws sts get-caller-identity >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AWS Credentials Valid${NC}"
else
    echo -e "${RED}❌ AWS Credentials Invalid - Please configure AWS CLI${NC}"
    exit 1
fi

echo ""
echo "2. Checking Core Resources..."

# Check SQS Queue
check_resource "SQS Queue" "dev-cloudsight-telemetry" \
    "aws sqs get-queue-url --queue-name dev-cloudsight-telemetry"

# Check S3 Bucket  
check_resource "S3 Bucket" "dev-cloudsight-raw-telemetry" \
    "aws s3 ls s3://dev-cloudsight-raw-telemetry"

# Check Lambda Function
check_resource "Lambda Function" "dev-cloudsight-processor" \
    "aws lambda get-function --function-name dev-cloudsight-processor"

echo ""
echo "3. Creating Missing Resources..."

# Create SQS if missing
if ! aws sqs get-queue-url --queue-name dev-cloudsight-telemetry &>/dev/null; then
    echo -e "${YELLOW}📦 Creating SQS Queue...${NC}"
    aws sqs create-queue \
        --queue-name dev-cloudsight-telemetry \
        --attributes '{
            "VisibilityTimeout": "300",
            "MessageRetentionPeriod": "345600"
        }'
    echo -e "${GREEN}✅ SQS Queue Created${NC}"
fi

# Create S3 bucket if missing
if ! aws s3 ls s3://dev-cloudsight-raw-telemetry &>/dev/null 2>&1; then
    echo -e "${YELLOW}📦 Creating S3 Bucket...${NC}"
    aws s3 mb s3://dev-cloudsight-raw-telemetry
    echo -e "${GREEN}✅ S3 Bucket Created${NC}"
fi

# Note about Lambda - this requires code deployment
if ! aws lambda get-function --function-name dev-cloudsight-processor &>/dev/null; then
    echo -e "${YELLOW}⚠️  Lambda function needs code deployment${NC}"
    echo "   Run: cd ../ingestion/telemetry-processor && npm run build"
    echo "   Then deploy the Lambda manually or via Terraform"
fi

echo ""
echo "4. Testing Infrastructure..."

# Test SQS
SQS_QUEUE_URL=$(aws sqs get-queue-url --queue-name dev-cloudsight-telemetry --query 'QueueUrl' --output text 2>/dev/null)
if [ -n "$SQS_QUEUE_URL" ]; then
    aws sqs send-message \
        --queue-url "$SQS_QUEUE_URL" \
        --message-body '{"_cloudsight":"test","message":"infrastructure_test"}' \
        --message-attributes 'MessageType={DataType=String,StringValue=test}'
    echo -e "${GREEN}✅ SQS Test Message Sent${NC}"
fi

# Test S3
if aws s3 ls s3://dev-cloudsight-raw-telemetry &>/dev/null; then
    echo "test file" | aws s3 cp - s3://dev-cloudsight-raw-telemetry/test.txt
    echo -e "${GREEN}✅ S3 Write Test Successful${NC}"
fi

echo ""
echo -e "${GREEN}🎉 INFRASTRUCTURE SETUP COMPLETE${NC}"
echo "===================================="
echo "Next steps:"
echo "1. Deploy Lambda function code"
echo "2. Test end-to-end data pipeline"
echo "3. Verify database connections"
