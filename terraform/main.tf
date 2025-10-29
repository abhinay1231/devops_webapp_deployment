# 1. Configure Terraform to use the Kubernetes provider
terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.29.0"
    }
  }
}

# 2. Tell the provider to use your local cluster
provider "kubernetes" {
  # This tells Terraform to use the default kubeconfig file
  # that Docker Desktop creates.
  config_path = "~/.kube/config"
}

# 3. Read and deploy all 6 of our new YAML files
#    (Note: The paths go up one folder '..' to find the 'k8s' directory)

resource "kubernetes_manifest" "mongo_deployment" {
  manifest = yamldecode(file("../k8s/1-mongo-deployment.yaml"))
  # (The 'namespace' line has been removed from here)
}

resource "kubernetes_manifest" "mongo_service" {
  manifest = yamldecode(file("../k8s/2-mongo-service.yaml"))
}

resource "kubernetes_manifest" "backend_deployment" {
  manifest = yamldecode(file("../k8s/3-backend-deployment.yaml"))
}

resource "kubernetes_manifest" "backend_service" {
  manifest = yamldecode(file("../k8s/4-backend-service.yaml"))
}

resource "kubernetes_manifest" "frontend_deployment" {
  manifest = yamldecode(file("../k8s/5-frontend-deployment.yaml"))
}

resource "kubernetes_manifest" "frontend_service" {
  manifest = yamldecode(file("../k8s/6-frontend-service.yaml"))
}

# 4. Define outputs (just like your medical project)
output "mongo_deployment_name" {
  value = kubernetes_manifest.mongo_deployment.manifest.metadata.name
}
output "mongo_service_name" {
  value = kubernetes_manifest.mongo_service.manifest.metadata.name
}
output "backend_deployment_name" {
  value = kubernetes_manifest.backend_deployment.manifest.metadata.name
}
output "backend_service_name" {
  value = kubernetes_manifest.backend_service.manifest.metadata.name
}
output "frontend_deployment_name" {
  value = kubernetes_manifest.frontend_deployment.manifest.metadata.name
}
output "frontend_service_name" {
  value = kubernetes_manifest.frontend_service.manifest.metadata.name
}