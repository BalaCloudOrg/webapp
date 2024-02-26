variable "project_id" {
  type        = string
  description = "The project id where the custom image will be placed"
  default     = "webapp-infra"
}

variable "zone" {
  type    = string
        default = "us-east1-b"
}

variable "source_image_family" {
  type        = string
  description = "The OS of the custom image"
  default     = "centos-stream-8"
}

variable "ssh_user" {
  type    = string
  default = "gcp-user"
}

variable "image_name" {
  type        = string
  description = "The name of the custom image"
  default     = "dev-centos-stream8-image"
}

variable "build_source" {
  type    = string
  default = "source.googlecompute.centos_stream_8"
}

variable "image_family" {
  type    = string
  default = "centos-custom-image"
}

packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = "~> 1"
    }
  }
}

source "googlecompute" "centos_stream_8" {
  project_id          = var.project_id
  zone                = var.zone
  source_image_family = var.source_image_family
  ssh_username        = var.ssh_user
  image_name          = var.image_name
  image_family        = var.image_family
}


build {
  sources = [var.build_source]

  provisioner "file" {
    source      = "../../test-src.zip"
    destination = "/tmp/"
  }

  provisioner "file" {
    source      = "../scripts/image-setup-script.sh"
    destination = "/tmp/image-setup-script.sh"
  }

  provisioner "shell" {
    inline = [
      "chmod +x /tmp/image-setup-script.sh",
      "sudo /tmp/image-setup-script.sh"
    ]
  }

  provisioner "shell" {
    inline = [
      "source ~/.bashrc"
    ]
  }

  provisioner "file" {
    source      = "../scripts/app-start-script.sh"
    destination = "/tmp/app-start-script.sh"
  }

  provisioner "shell" {
    inline = [
      "chmod +x /tmp/app-start-script.sh",
      "sudo /tmp/app-start-script.sh"
    ]
  }
}  
