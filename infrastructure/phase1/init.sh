#!/bin/bash

echo "Initializing Terraform..."
terraform init

echo "Validating configuration..."
terraform validate

echo "Planning deployment..."
terraform plan -var-file="environments/dev/terraform.tfvars"

echo "Setup complete! Run 'terraform apply' to deploy."
