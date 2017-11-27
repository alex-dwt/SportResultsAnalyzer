FROM node:8
MAINTAINER Alexander Lukashevich <aleksandr.dwt@gmail.com>

RUN apt-get update && apt-get install -y tor polipo
WORKDIR /usr/src/app