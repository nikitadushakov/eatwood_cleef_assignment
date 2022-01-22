FROM python:3.9

WORKDIR /home

ENV TZ=Europe/Moscow
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN mkdir static
COPY * ./
COPY static/* ./static

RUN pip install -r requirements.txt
EXPOSE 8002

ENTRYPOINT ["python", "main.py"]