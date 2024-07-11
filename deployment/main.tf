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

resource "null_resource" "create_tarball" {
  provisioner "local-exec" {
    command = "tar -czf /tmp/config.tar.gz -C ./config ."
  }

  triggers = {
    always_run = "${timestamp()}"
  }
}

resource "digitalocean_droplet" "vm" {
  image  = "ubuntu-20-04-x64"
  name   = var.droplet_name
  region = "fra1"
  size   = "s-1vcpu-2gb"
  
  ssh_keys = [
    var.ssh_fingerprint
  ]

  connection {
    host        = self.ipv4_address
    type        = "ssh"
    user        = "root"
    agent       = true
  }

  depends_on = [null_resource.create_tarball]

  provisioner "file" {
    source      = "/tmp/config.tar.gz"
    destination = "/tmp/config.tar.gz"
  }

   provisioner "remote-exec" {
    inline = [
      "mkdir -p ~/remoodle",
      "tar -xzf /tmp/config.tar.gz -C ~/remoodle",
      "rm /tmp/config.tar.gz",
      "bash ~/remoodle/setup.sh",
      "docker compose -f compose.db.yml up -d",
    ]
  }
}

resource "null_resource" "cleanup_local_file" {
  depends_on = [
    digitalocean_droplet.vm
  ]

  provisioner "local-exec" {
    command = "rm /tmp/config.tar.gz"
  }

  triggers = {
    always_run = "${timestamp()}"
  }
}
