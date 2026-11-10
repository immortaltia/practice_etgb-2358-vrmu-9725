# Node.js + PostgreSQL: Docker, Terraform, GitHub Actions

## Purpose

A Node.js HTTP service that connects to PostgreSQL and returns `Hello world!`.
The project demonstrates a full DevOps pipeline:

1. The application runs locally in Docker.
2. Terraform creates the AWS infrastructure (security group and EC2 instance with Docker).
3. A push to `main` triggers GitHub Actions, which builds the image, pushes it to Docker Hub and deploys it to EC2.

## Structure

```
.github/workflows/ci.yml        CI/CD pipeline
.gitignore
students/AV/
  index.js                      application
  package.json
  package-lock.json
  Dockerfile                    production image
  docker-compose.yml            app + PostgreSQL (used locally and on EC2)
  docker-compose.override.yml   local build of the app image
  terraform/                    AWS infrastructure
  README.md
```

## Run locally

Requirements: Docker with the Compose plugin.

```
cd students/AV
docker compose up --build -d
docker compose logs app
curl http://localhost:3000
docker compose down
```

The application is available at http://localhost:3000.

## Infrastructure (Terraform)

Requirements: Terraform >= 1.5, AWS credentials, an existing EC2 key pair in the chosen region.

```
cd students/AV/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Edit `terraform.tfvars` before applying: `ami_id` must be an Ubuntu AMI available in `aws_region`, `key_name` is the name of an existing key pair and `key_path` is the path to its private key.

Created resources:

- security group with ports 22 (SSH) and 3000 (application) open
- EC2 instance with Docker installed through `user_data`

Outputs: `instance_ip`, `app_url`, `ssh_command`.
To remove everything: `terraform destroy`.

## Deploy pipeline

Workflow: `.github/workflows/ci.yml`. It runs on every push to `main`.

Job `build`:

1. Checks out the repository.
2. Uses the short commit hash as the image tag.
3. Logs in to Docker Hub.
4. Builds the image from `students/AV` and pushes `<DOCKERHUB_USERNAME>/nodeapp:<hash>` and `:latest`.

Job `deploy` (runs after `build`):

1. Decodes the SSH key from `EC2_SSH_KEY_B64`.
2. Waits until the instance initialization (`cloud-init`) is finished.
3. Copies `docker-compose.yml` to EC2.
4. Runs `docker compose up -d --pull always` with the new image tag.
5. Checks that the application answers on port 3000.

Order of the first deploy: `terraform apply` → set `EC2_HOST` from `instance_ip` → push to `main`.

## GitHub Secrets

| Secret | Description |
|---|---|
| DOCKERHUB_USERNAME | Docker Hub username |
| DOCKERHUB_TOKEN | Docker Hub access token |
| EC2_SSH_KEY_B64 | private SSH key (`.pem`) encoded in base64 |
| EC2_HOST | public IP of the EC2 instance (`instance_ip`) |
| EC2_USER | SSH user, `ubuntu` |

AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) are only needed locally for Terraform and are not stored in GitHub Secrets.

PowerShell command for `EC2_SSH_KEY_B64`:

```
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\key.pem"))
```

## Environment variables

Application (set in `docker-compose.yml`):

| Variable | Default | Description |
|---|---|---|
| PORT | 3000 | HTTP port |
| DB_HOST | localhost | PostgreSQL host (`db` in Compose) |
| DB_PORT | 5432 | PostgreSQL port |
| DB_USER | postgres | database user |
| DB_PASSWORD | postgres | database password |
| DB_NAME | appdb | database name |

Compose substitutes `DOCKER_USERNAME`, `IMAGE_TAG`, `DB_USER`, `DB_PASSWORD` and `DB_NAME` from the shell environment. Defaults are used when they are not set.

Terraform (`terraform.tfvars`): `aws_region`, `ami_id`, `instance_type`, `key_name`, `key_path`, `security_group_name`, `instance_name`.

## Git workflow

- `main` holds the deployed state; every push to it deploys.
- Work is done in short-lived branches (`feature/...`) and merged into `main`.
- Commit messages are short imperative sentences, for example `Add Terraform configuration`.
- Keys, `.env` files, `terraform.tfvars`, state files and `.terraform/` are excluded by `.gitignore`.
