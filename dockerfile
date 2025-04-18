# Use Debian-based Ruby image (not Alpine) for better native extension support
FROM ruby:3.1

# Set working directory
WORKDIR /app

# Install necessary packages
RUN apt-get update -qq && \
    apt-get install -y build-essential git cmake libprotobuf-dev protobuf-compiler nodejs npm

# Install bundler and jekyll
RUN gem install bundler jekyll

# Copy project files into container
COPY . .

# Install dependencies (will use your Gemfile)
RUN bundle install
