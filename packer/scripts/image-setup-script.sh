#!/bin/bash

# Exit on any error
set -e

# 1. Update the packages
sudo dnf update -y

# 2. Check available Node.js versions
sudo dnf module list nodejs

# 3. Enable the latest Node.js module version available before 21
sudo dnf module enable -y nodejs:20

# 4. Install Node.js
sudo dnf install -y nodejs

# 5. Check Node.js version
node --version

# 6. Check npm version
npm --version

# 7. install unzip
sudo dnf install -y unzip

# 8. Create user and group
sudo groupadd csye6225
sudo useradd -r -s /usr/sbin/nologin -g csye6225 csye6225

# 9. Unzip the application code
sudo unzip /tmp/test-src.zip -d /opt/test-src

# 10. Navigate into the folder and install dependencies
cd /opt/test-src
npm i || true
echo "completed npm i"
npm i bcrypt
echo "completed npm i brcrypt"

# 11. Navigate back to the home directory
cd ~

# 12. Change ownership and set executable permissions
sudo chown -R csye6225:csye6225 /opt/test-src

# sudo chown -R csye6225:csye6225 /opt/config.env

# 13. Setting executable permissions
# For directories: grant read, write, and execute permissions to user and group
# For files: grant read and execute permissions to user and group
sudo find /opt/test-src -type d -exec chmod 750 {} \;
# sudo find /opt/test-src -type f -exec chmod 640 {} \;

# If you also want to ensure that all files are executable by the user and group, change the file permission line to:
sudo find /opt/test-src -type f -exec chmod 750 {} \;

# 14. Create the systemd service file
# Environment=MYSQL_HOST="localhost"
# Environment=MYSQL_USER="user1"
# Environment=MYSQL_PASSWORD="Abcd@123"
# Environment=MYSQL_DATABASE="test"
sudo tee /etc/systemd/system/webapp-service.service << 'EOF'
[Unit]
Description=CSYE 6225 App
After=network.target google-startup-scripts.service
ConditionPathExists=/opt/config.env

[Service]
Environment=PORT="3000"
EnvironmentFile=/opt/config.env
Type=simple
User=csye6225
Group=csye6225
WorkingDirectory=/opt/test-src/
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=3
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=csye6225

[Install]
WantedBy=multi-user.target

EOF

# 15. Reload systemd and enable the service
sudo systemctl daemon-reload
sudo systemctl enable webapp-service.service
sudo systemctl start webapp-service.service

# 16. Create log file location
sudo mkdir -p /var/log/webapp

# 17. Creating soft symbolic link from the app's log file to the machine
sudo ln -s /opt/test-src/app.log /var/log/webapp/app.log

# 18. Changing ownership of the machine's log file
sudo chown csye6225:csye6225 /var/log/webapp