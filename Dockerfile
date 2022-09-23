FROM njhxzhangjh/web_base:2.0

WORKDIR /root/web/favlinks

COPY ./ /root/web/favlinks

## comment
RUN cd /root/web/favlinks
RUN npm run start 
