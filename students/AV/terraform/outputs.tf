output "instance_ip" {
  value = aws_instance.app.public_ip
}

output "app_url" {
  value = "http://${aws_instance.app.public_ip}:3000"
}

output "ssh_command" {
  value = "ssh -i ${var.key_path} ubuntu@${aws_instance.app.public_ip}"
}
