output "telemetry_queue_arn" {
  value = aws_sqs_queue.telemetry.arn
}

output "telemetry_queue_name" {
  value = aws_sqs_queue.telemetry.name
}

output "telemetry_queue_url" {
  value = aws_sqs_queue.telemetry.url
}
