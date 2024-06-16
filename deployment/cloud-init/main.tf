terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }

  required_version = ">= 0.14"
}

provider "digitalocean" {
  token = var.do_token
}

data "archive_file" "config_archive" {
  type        = "zip"
  source_dir  = "../config"
  output_path = "/tmp/config.tar.gz"
}

resource "null_resource" "create_tarball" {
  provisioner "local-exec" {
    command = "tar -czf /tmp/config.tar.gz -C ../ config"
  }

  triggers = {
    always_run = "${timestamp()}"
  }
}

resource "digitalocean_droplet" "sylveon" {
  image  = "ubuntu-20-04-x64"
  name   = "sylveon"
  region = "fra1"
  size   = "s-1vcpu-2gb"
  user_data = "${file("setup.sh")}"

  ssh_keys = [
    var.ssh_fingerprint
  ]

  connection {
    host        = self.ipv4_address
    type        = "ssh"
    user        = "root"
    agent       = true
  }

  provisioner "file" {
    source      = data.archive_file.config_archive.output_path
    destination = "/tmp/config.tar.gz"
  }

  provisioner "remote-exec" {
    inline = [
      "cd ~",
      "mkdir remoodle",
      "tar -xzf /tmp/config.tar.gz -C remoodle --strip-components=1",
      "rm /tmp/config.tar.gz"
    ]
  }
}

resource "null_resource" "cleanup_local_file" {
  depends_on = [
    digitalocean_droplet.sylveon
  ]

  provisioner "local-exec" {
    command = "rm /tmp/config.tar.gz"
  }

  triggers = {
    always_run = "${timestamp()}"
  }
}