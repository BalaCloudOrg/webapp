#!/bin/bash

# enable mysql service on start
# sudo systemctl enable mysqld

# install unzip
sudo dnf install -y unzip


# 1. Create user and group
sudo groupadd csye6225
sudo useradd -r -s /usr/sbin/nologin -g csye6225 csye6225

# 2. Unzip the application code
sudo unzip /opt/test-src.zip -d /opt/test-src

# Navigate into the folder and install dependencies
cd /opt/test-src
npm i || true
echo "completed npm i"
npm i bcrypt
echo "completed npm i brcrypt"

# Navigate back to the home directory
cd ~

# 4. Change ownership and set executable permissions
sudo chown -R csye6225:csye6225 /opt/test-src

sudo chown -R csye6225:csye6225 /opt/test-src.zip

sudo chown -R csye6225:csye6225 /opt/config.env

# Setting executable permissions
# For directories: grant read, write, and execute permissions to user and group
# For files: grant read and execute permissions to user and group
sudo find /opt/test-src -type d -exec chmod 750 {} \;
# sudo find /opt/test-src -type f -exec chmod 640 {} \;

# If you also want to ensure that all files are executable by the user and group, change the file permission line to:
sudo find /opt/test-src -type f -exec chmod 750 {} \;

# 5. Create the systemd service file
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

# 6. Reload systemd and enable the service
sudo systemctl daemon-reload
sudo systemctl enable webapp-service.service
sudo systemctl start webapp-service.service
