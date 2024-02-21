variable "project_id" {
  type    = string
  default = "webapp-infra"
}

variable "zone" {
  type    = string
  default = "us-east1-b"
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
  source_image_family = "centos-stream-8"
  // source_image            = "centos-stream-8-v20230509"
  ssh_username = "gcp-user"
  image_name   = "dev-centos-stream8-image-v4-sh"
}

// source "googlecompute" "centos8-stream" {
//   project_id   = "terraform-project"
//   source_image = "centos-stream-8-v20230509"
//   image_name   = "dev-centos-stream8-image"
//   ssh_username = "gcp-user"
//   zone         = "us-central1-a"
// }

build {
  sources = [
    "source.googlecompute.centos_stream_8",
  ]

  provisioner "file" {
    source      = "/Users/santhosh/Downloads/test-src.zip"
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