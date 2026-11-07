## CI-node-demo

Simple Node.js app with PostgreSQL, built with Docker and deployed to EC2 using GitHub Actions.

### Run locally

```
export DOCKERHUB_USERNAME=<your-name>
export IMAGE_TAG=$(git rev-parse --short HEAD)
docker build -t $DOCKERHUB_USERNAME/nodeapp:$IMAGE_TAG .
docker compose up -d
docker compose logs app
```

### CI/CD

- image tag is the short commit hash
- image is pushed to Docker Hub
- docker-compose.yml is copied to EC2 and started with docker compose

### Infrastructure (Terraform)

```
cd terraform
terraform init
terraform plan
terraform apply
terraform destroy
```

- creates a Security Group (ports 22 and 3000) and an EC2 instance with Docker installed
- the value of `instance_ip` goes into the `EC2_HOST` GitHub secret
- `EC2_USER` secret must be `ubuntu`
