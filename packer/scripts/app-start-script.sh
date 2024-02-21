#!/bin/bash

# enable mysql service on start
sudo systemctl enable mysqld

# install unzip
sudo dnf install -y unzip


# 1. Create user and group
sudo groupadd csye6225
sudo useradd -r -s /usr/sbin/nologin -g csye6225 csye6225

# 2. Unzip the application code
sudo unzip /tmp/test-src.zip -d /tmp/test-src

# Navigate into the folder and install dependencies
cd /tmp/test-src
npm i || true
echo "completed npm i"
npm i bcrypt
echo "completed npm i brcrypt"

# Navigate back to the home directory
cd ~

# 4. Change ownership and set executable permissions
sudo chown -R csye6225:csye6225 /tmp/test-src

# Setting executable permissions
# For directories: grant read, write, and execute permissions to user and group
# For files: grant read and execute permissions to user and group
sudo find /tmp/test-src -type d -exec chmod 750 {} \;
# sudo find /tmp/test-src -type f -exec chmod 640 {} \;

# If you also want to ensure that all files are executable by the user and group, change the file permission line to:
sudo find /tmp/test-src -type f -exec chmod 750 {} \;

# 5. Create the systemd service file
sudo tee /etc/systemd/system/webapp-service.service << 'EOF'
[Unit]
Description=CSYE 6225 App
After=network.target

[Service]
Environment=PORT="3000"
Environment=MYSQL_HOST="localhost"
Environment=MYSQL_USER="user1"
Environment=MYSQL_PASSWORD="Abcd@123"
Environment=MYSQL_DATABASE="test"
Type=simple
User=csye6225
Group=csye6225
WorkingDirectory=/tmp/test-src/
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=3
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=csye6225

[Install]
WantedBy=multi-user.target

EOF

# 6. Reload systemd and enable the service
sudo systemctl daemon-reload
sudo systemctl enable webapp-service.service
sudo systemctl start webapp-service.service
