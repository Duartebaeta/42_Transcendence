FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY frontend/srcs/ /usr/src/app/

# Step 6: Expose the port your app runs on
EXPOSE 3000

# Step 7: Define the command to run your app
CMD ["node", "server.js"]
