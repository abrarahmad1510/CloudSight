# IAM policy for SQS send permissions (for test Lambda functions)
resource "aws_iam_policy" "sqs_send" {
  name        = "${var.resource_prefix}-sqs-send"
  description = "Permissions for sending messages to SQS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:GetQueueUrl",
          "sqs:GetQueueAttributes"
        ]
        Resource = var.sqs_arn
      }
    ]
  })
}

# Output the policy ARN for use by test functions
output "sqs_send_policy_arn" {
  value = aws_iam_policy.sqs_send.arn
}
