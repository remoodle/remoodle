variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "ssh_fingerprint" {
  description = "SSH fingerprint"
  type        = string
}

variable "private_key_path" {
  description = "Path to the SSH private key"
  type        = string
}