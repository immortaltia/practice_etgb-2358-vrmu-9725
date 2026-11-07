variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "ami_id" {
  type    = string
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "key_name" {
  type = string
}

variable "key_path" {
  type = string
}

variable "security_group_name" {
  type    = string
  default = "nodeapp-sg"
}

variable "instance_name" {
  type    = string
  default = "nodeapp-server"
}
