#!/bin/bash

# Exit on any error
set -e

# 1. Update the packages
sudo dnf update -y

# 2. Install the mysql-server
# echo "y" | sudo dnf install mysql-server

# 3. Start the mysql service
# sudo systemctl start mysqld.service

# 4. Check the status of the mysql service
# sudo systemctl status mysqld

# 5. Verify mysql command execution as root user
# mysqladmin -u root version

# 6. MYSQL setup
# mysql -u root <<EOF
# CREATE DATABASE IF NOT EXISTS test;
# CREATE USER 'user1'@'localhost' IDENTIFIED BY 'Abcd@123';
# GRANT ALL PRIVILEGES ON test.* TO 'user1'@'localhost';
# FLUSH PRIVILEGES;
# EOF


# 7. Set environment variables in .bashrc
# cat << EOF >> ~/.bashrc

# config for webapp
# export PORT="3000"
# export MYSQL_HOST="localhost"
# export MYSQL_USER="user1"
# export MYSQL_PASSWORD="Abcd@123"
# export MYSQL_DATABASE="test"
# EOF

# 8. Source .bashrc (Note: Sourcing in a script will not affect the parent shell)
# source ~/.bashrc

# 8. Check available Node.js versions
sudo dnf module list nodejs

# 9. Enable the latest Node.js module version available before 21
sudo dnf module enable -y nodejs:20

# 10. Install Node.js
sudo dnf install -y nodejs

# 11. Check Node.js version
node --version

# 12. Check npm version
npm --version
