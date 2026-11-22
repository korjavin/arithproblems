FROM nginx:alpine

# Add build argument for commit SHA
ARG COMMIT_SHA=unknown

# Copy all static files
COPY . /usr/share/nginx/html

# Revalidate every file on each load so a deploy is never mixed with cached old modules/locales
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Put the commit into index.html and into every app file URL (see the script)
RUN sh /usr/share/nginx/html/scripts/stamp-version.sh /usr/share/nginx/html "${COMMIT_SHA}"