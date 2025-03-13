FROM postgres:latest
 
COPY ./init_db.sql /docker-entrypoint-initdb.d/init_db.sql

CMD ["postgres"]