# Packages the production build output (dist/) produced by the CI pipeline.
# This Dockerfile ships inside the CI artifact (taskflow-<CI build>.tar.gz) so the
# CD pipeline can build the image WITHOUT rebuilding the React source.
FROM nginx:1.27-alpine

COPY dist/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
