FROM node:lts-buster

# Clone bot from GitHub
RUN git clone https://github.com/novaxmd/NOVA-XMD.git /root/popkid-xtr-bot

# Set working directory
WORKDIR /root/nova-xmd-bot

# Install dependencies
RUN npm install && npm install -g pm2

# Expose port
EXPOSE 9090

# Start the bot
CMD ["npm", "start"]
