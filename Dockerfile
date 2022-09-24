FROM node:10.24.1

WORKDIR /favlinks
COPY ./ /favlinks

## comment
RUN npm i 
EXPOSE 3000

CMD ["npm", "run", "start"]
