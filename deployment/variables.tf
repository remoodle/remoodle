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

variable "droplet_name" {
  description = "The name of the DigitalOcean droplet"
  type        = string
  default     = "sylveon"
}

variable "ghp_token" {
  description = "GitHub personal access token"
  type        = string
  sensitive   = true
}