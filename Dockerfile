FROM nginx:alpine

# Add build argument for commit SHA
ARG COMMIT_SHA=unknown

# Copy all static files
COPY . /usr/share/nginx/html

# Revalidate every file on each load so a deploy is never mixed with cached old modules/locales
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Run sed to replace the placeholder in index.html
RUN sed -i "s/__COMMIT_SHA__/${COMMIT_SHA}/g" /usr/share/nginx/html/index.html