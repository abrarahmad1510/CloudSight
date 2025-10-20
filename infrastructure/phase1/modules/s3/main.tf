resource "aws_s3_bucket" "telemetry" {
  bucket = "${var.resource_prefix}-raw-telemetry"

  tags = var.tags
}

resource "aws_s3_bucket_lifecycle_configuration" "lifecycle" {
  bucket = aws_s3_bucket.telemetry.id

  rule {
    id     = "archive_to_glacier"
    status = "Enabled"

    transition {
      days          = var.s3_config.glacier_transition_days
      storage_class = "GLACIER"
    }

    expiration {
      days = var.s3_config.expiration_days
    }
  }
}
