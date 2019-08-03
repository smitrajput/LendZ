# Use an official Python runtime as a parent image
FROM python:3.6-slim

# Set the working directory to /app
#VOLUME fast_api
WORKDIR /fast_api
ADD requirements.txt .
# Copy the current directory contents into the container at /app
#COPY ./requirements.txt /fast_api
RUN apt-get update
RUN apt-get install -y wget lsb-release && wget http://packages.couchbase.com/releases/couchbase-release/couchbase-release-1.0-6-amd64.deb
RUN dpkg -i couchbase-release-1.0-6-amd64.deb
# Will install or upgrade packages
RUN apt-get update && apt-get install -y libcouchbase-dev libcouchbase2-bin build-essential

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# Make port 80 available to the world outside this container
#EXPOSE 80

# Define environment variable
#ENV NAME World
#COPY . /fast_api

# Run app.py when the container launches
# CMD uvicorn main:app --reload & python3 user_test.py
CMD uvicorn main:app --reload
# RUN sleep 10
# RUN python3 ./user_test.py